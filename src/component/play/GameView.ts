import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { CellItem } from "../../model/CellItem";
import * as Constant from "../../model/Constants";
import { MOVE_DIRECTION } from "../../model/Constants";
import { useBattleManager } from "../../service/BattleManager";
import * as gameEngine from "../../service/GameEngine";
import { useGameManager } from "../../service/GameManager";
import { SceneModel, useSceneManager } from "../../service/SceneManager";
import { ANIMATE_NAME } from "../animation/AnimateConstants";
import { AnimateElement, useAnimateManager } from "../animation/AnimateManager";
import useAnimationManager from "../animation/AnimationManager";
import { CandySprite } from "../pixi/CandySprite";


const getSwipeTarget = (cellItem: CellItem, direction: number, cells: CellItem[]): CellItem | undefined => {

    let target;
    if (cellItem) {
        switch (direction) {
            //right move
            case MOVE_DIRECTION.RIGHT:
                target = cells.find((c) => c.row === cellItem.row && c.column === cellItem.column + 1);
                break;
            //down move
            case MOVE_DIRECTION.DOWN:
                target = cells.find((c) => c.row === cellItem.row + 1 && c.column === cellItem.column);
                break;
            //left move
            case MOVE_DIRECTION.LEFT:
                target = cells.find((c) => c.row === cellItem.row && c.column === cellItem.column - 1);
                break;
            //up move
            case MOVE_DIRECTION.UP:
                target = cells.find((c) => c.row === cellItem.row - 1 && c.column === cellItem.column);
                break;
            default:
                break;
        }
    }

    return target;

}

const useGameView = (scene: SceneModel | null) => {
    // const { app, textures, candies } = scene;
    const cellsRef = useRef<CellItem[]>([])
    const { gameEvent, cells, gameId, swapCell, smash } = useGameManager();
    const { battle } = useBattleManager();
    const { textures } = useSceneManager();

    const dragRef = useRef<{ startX: number; startY: number; animation: number, cellId: number }>({ startX: 0, startY: 0, cellId: -1, animation: 0 });
    const animateManager = useAnimateManager();
    const animationManager = useAnimationManager();

    const swipe = useCallback((direction: number, candyId: number) => {

        if (!gameId || !cells) return;
        console.log(gameId + ":" + animateManager.checkIfAnimate(gameId))
        if (animateManager.checkIfAnimate(gameId)) return
        const cell = cellsRef.current.find((c) => c.id === candyId);
        if (cell) {
            const target = getSwipeTarget(cell, direction, cellsRef.current);
            if (target) {
                const ncells: CellItem[] = JSON.parse(JSON.stringify(cells));
                const ncell: CellItem | undefined = ncells.find((c: CellItem) => c.id === cell.id);
                const ntarget: CellItem | undefined = ncells.find((c: CellItem) => c.id === target.id);
                if (!ncell || !ntarget) return;
                [ncell.row, ntarget.row] = [ntarget.row, ncell.row];
                [ncell.column, ntarget.column] = [ntarget.column, ncell.column];
                ncells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)
                const grid: CellItem[][] = Array.from({ length: Constant.ROW }, () => Array(Constant.COLUMN).fill(null));
                for (const unit of ncells) {
                    grid[unit.row][unit.column] = unit;
                }
                const candy = scene?.candies?.get(ncell.id);
                const tcandy = scene?.candies?.get(ntarget.id);
                if (candy && tcandy) {
                    // console.log(candy.column + ":" + candy.row + ";" + tcandy.column + ":" + tcandy.row)
                    // const eles: AnimateElement[] = [{ name: "candy", type: 0, ele: candy }, { name: "target", type: 0, ele: tcandy }];
                    if (gameEngine.checkSwipe(grid)) {
                        // candy.row = ncell.row;
                        // candy.column = ncell.column;
                        // tcandy.row = ntarget.row;
                        // tcandy.column = ntarget.column;
                        animateManager.createAnimate({ name: ANIMATE_NAME.SWIPE_SUCCESS, gameId, eles: [], data: { candy: ncell, target: ntarget } })
                        swapCell(ncell.id, ntarget.id)
                        // animationManager.startSwipe(gameId, ncell, ntarget)
                    } else {
                        animateManager.createAnimate({ name: ANIMATE_NAME.SWIPE_FAIL, gameId, eles: [], data: { candyId, targetId: target.id } })
                        console.log(animateManager.checkIfAnimate(gameId))
                        // animationManager.cancelSwipe(gameId ?? "", cell, target)
                    }
                }
            }


        }
    }, [cells, gameId, scene, animateManager, swapCell])


    const createCandySprite = useCallback((cell: CellItem, x: number, y: number): PIXI.Sprite | null => {
        if (!gameId || !scene) return null;
        // const scene: SceneModel | undefined = scenes.get(gameId)
        const texture = textures?.find((d) => d.id === cell.asset);
        if (texture && scene?.app && scene.cwidth) {
            const stage = (scene.app as PIXI.Application).stage;
            // const sprite = new PIXI.Sprite(texture.texture);
            const sprite = new CandySprite(texture.texture, cell.id, cell.column, cell.row)
            sprite.anchor.set(0.5);
            sprite.width = scene.cwidth;
            sprite.height = scene.cwidth;
            sprite.x = x;
            sprite.y = y;
            stage.addChild(sprite);
            sprite.eventMode = 'static';
            if (battle?.type !== Constant.BATTLE_TYPE.REPLAY) {
                sprite.on("pointerdown", (event: PointerEvent) => {
                    const drag = dragRef.current;
                    drag.startX = event.x;
                    drag.startY = event.y;
                    drag.cellId = cell.id;
                });
                // sprite.on("pointermove", (event: PointerEvent) => {
                //     const drag = dragRef.current;
                //     const deltaX = event.x - drag.startX;
                //     const deltaY = event.y - drag.startY;
                //     let direction = 0;
                //     if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10)
                //         direction = deltaX > 0 ? MOVE_DIRECTION.RIGHT : MOVE_DIRECTION.LEFT;
                //     else if (Math.abs(deltaY) > 10)
                //         direction = deltaY > 0 ? MOVE_DIRECTION.DOWN : MOVE_DIRECTION.UP;
                //     drag.direction = direction
                //     console.log("moving.." + drag.direction)
                // });
                sprite.on("pointerup", (event: PointerEvent) => {

                    const drag = dragRef.current;
                    const deltaX = event.x - drag.startX;
                    const deltaY = event.y - drag.startY;
                    let direction = 0;
                    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10)
                        direction = deltaX > 0 ? MOVE_DIRECTION.RIGHT : MOVE_DIRECTION.LEFT;
                    else if (Math.abs(deltaY) > 10)
                        direction = deltaY > 0 ? MOVE_DIRECTION.DOWN : MOVE_DIRECTION.UP;
                    console.log("direction:" + direction)
                    if (direction > 0) {
                        swipe(direction, drag.cellId)
                    } else {
                        smash(drag.cellId)
                    }
                    // drag.cellId = -1
                });
            }
            return sprite;
        }
        return null;
    }, [scene, animateManager, gameId])

    const initCandies = useCallback((candies: CellItem[]) => {
        const cwidth = scene && typeof scene.cwidth !== 'undefined' ? scene.cwidth : 0;
        if (gameId && scene && scene.candies && cwidth) {
            candies.forEach((c) => {
                const x = c.column * cwidth + Math.floor(cwidth / 2);
                const y = c.row * cwidth + Math.floor(cwidth / 2);
                const sprite = createCandySprite(c, x, y);
                if (sprite) {
                    // sprite.alpha = 0
                    scene.candies?.set(c.id, sprite as CandySprite)
                }
            })
            const ele: AnimateElement = { name: "gamescene", type: 1, ele: scene }
            animateManager.createAnimate({ name: ANIMATE_NAME.GAME_INITED, eles: [ele] })
        }
    }, [scene])

    useEffect(() => {
        if (cells) {
            cellsRef.current = cells
            initCandies(JSON.parse(JSON.stringify(cells)))
        }
    }, [cells, initCandies])
    useEffect(() => {
        if (!gameId || !scene) return;
        if (gameEvent?.name === "cellSwapped") {

            const data: { candy: CellItem; target: CellItem; results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] } = gameEvent.data;

            for (let res of data.results) {
                const size = res.toCreate.length;
                const cwidth = scene && typeof scene.cwidth !== 'undefined' ? scene.cwidth : 0;
                if (cwidth)
                    res.toCreate.forEach((cell: CellItem) => {
                        const x = cell.column * cwidth + Math.floor(cwidth / 2);
                        const y = -cwidth * (size - cell.row) - Math.floor(cwidth / 2);
                        const sprite = createCandySprite(cell, x, y);
                        if (sprite && scene?.candies)
                            scene.candies.set(cell.id, sprite as CandySprite)
                    })
            }
            if (gameId) {
                // const ids = cells?.map((c) => c.id).sort((a, b) => a - b)
                // console.log(ids)
                // animationManager.solveSwipe(gameId, data)
                console.log(data)
                animateManager.createAnimate({ name: ANIMATE_NAME.CANDY_SWAPPED, gameId, data })
            }
        } else if (gameEvent?.name === "cellSmeshed") {
            const data: { candyId: number; results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] } = gameEvent.data;
            for (let res of data.results) {
                const cwidth = scene && typeof scene.cwidth !== 'undefined' ? scene.cwidth : 0;
                if (cwidth)
                    res.toCreate.forEach((cell: CellItem) => {
                        const x = cell.column * cwidth + Math.floor(cwidth / 2);
                        const y = -cwidth;
                        const sprite = createCandySprite(cell, x, y);
                        if (sprite && scene?.candies) {
                            scene.candies.set(cell.id, sprite as CandySprite)
                        }
                    })
            }
            if (gameId)
                animationManager.solveSmesh(gameId, data)

        }
    }, [gameEvent, scene])

}
export default useGameView



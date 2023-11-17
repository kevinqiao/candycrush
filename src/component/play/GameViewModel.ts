import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { CellItem } from "../../model/CellItem";
import * as Constant from "../../model/Constants";
import { MOVE_DIRECTION } from "../../model/Constants";
import useAnimationManager from "../../service/AnimationManager";
import { useBattleManager } from "../../service/BattleManager";
import * as gameEngine from "../../service/GameEngine";
import { useGameManager } from "../../service/GameManager";
import { SceneModel, useSceneManager } from "../../service/SceneManager";


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

const useGameViewModel = (scene: SceneModel | undefined) => {
    // const { app, textures, candies } = scene;
    const { gameEvent, gameId, swapCell, smash } = useGameManager();
    const { battle } = useBattleManager();
    const { textures } = useSceneManager();

    const dragRef = useRef<{ startX: number; startY: number; animation: number, cellId: number }>({ startX: 0, startY: 0, cellId: -1, animation: 0 });

    const animationManager = useAnimationManager();

    const swipe = (direction: number, candyId: number) => {
        if (!scene?.candies || !gameId) return;
        // const cells: CellItem[] = Array.from(candyMapRef.current.values()).map((v) => v.data);
        const cells: CellItem[] = Array.from(scene?.candies.values()).map((v) => v.data);
        const candy = cells.find((c) => c.id === candyId);
        if (candy) {
            const target = getSwipeTarget(candy, direction, cells);
            if (target) {
                const ncells = JSON.parse(JSON.stringify(cells));
                const ncandy = ncells.find((c: CellItem) => c.id === candy.id);
                const ntarget = ncells.find((c: CellItem) => c.id === target.id);
                [ncandy.row, ntarget.row] = [ntarget.row, ncandy.row];
                [ncandy.column, ntarget.column] = [ntarget.column, ncandy.column];
                const grid: CellItem[][] = Array.from({ length: Constant.ROW }, () => Array(Constant.COLUMN).fill(null));
                for (const unit of ncells) {
                    // console.log(unit.row + ":" + unit.column + ":" + unit.asset)
                    grid[unit.row][unit.column] = unit;
                }
                const matches = gameEngine.findMatches(grid)
                // const results: { toRemove: CellItem[], toChange: CellItem[] } = gameEngine.getSwipeResult(candy.id, target.id, JSON.parse(JSON.stringify(cells)));

                // if (results.toChange.length > 0 || results.toRemove.length > 0) {
                if (matches?.length > 0) {
                    animationManager.startSwipe(gameId, candy, target)
                    swapCell(candy.id, target.id)
                } else {
                    animationManager.cancelSwipe(gameId ?? "", candy, target)
                }
            }
        }
    }


    const createCandySprite = useCallback((cell: CellItem, x: number, y: number): PIXI.Sprite | null => {

        const texture = textures?.find((d) => d.id === cell.asset);
        if (gameId && texture && scene?.app?.stage && scene.cwidth) {

            const sprite = new PIXI.Sprite(texture.texture);
            sprite.anchor.set(0.5);
            sprite.width = scene.cwidth;
            sprite.height = scene.cwidth;
            sprite.x = x;
            sprite.y = y;
            scene?.app.stage.addChild(sprite);
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
    }, [scene, gameId, scene?.textures])

    const initCandies = (cells: CellItem[]) => {
        const cwidth = scene && typeof scene.cwidth !== 'undefined' ? scene.cwidth : 0;

        if (scene && cells && scene.candies && cwidth)
            cells.forEach((c) => {
                const x = c.column * cwidth + Math.floor(cwidth / 2);
                const y = c.row * cwidth + Math.floor(cwidth / 2);
                const sprite = createCandySprite(c, x, y);
                if (sprite)
                    scene.candies?.set(c.id, { id: c.id, sprite, data: c })
            })
    }

    useEffect(() => {

        if (gameEvent?.name === "initGame") {
            const { cells } = gameEvent.data;
            initCandies(JSON.parse(JSON.stringify(cells)))
        } else if (gameEvent?.name === "cellSwapped") {
            // log();
            // const cellW = cellWRef.current;
            console.log(gameEvent)
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
                            scene.candies.set(cell.id, { id: cell.id, sprite, data: JSON.parse(JSON.stringify(cell)) })
                    })
            }
            if (gameId)
                animationManager.solveSwipe(gameId, data)
        } else if (gameEvent?.name === "cellSmeshed") {
            const data: { candyId: number; results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] } = gameEvent.data;
            for (let res of data.results) {
                const cwidth = scene && typeof scene.cwidth !== 'undefined' ? scene.cwidth : 0;
                if (cwidth)
                    res.toCreate.forEach((cell: CellItem) => {
                        const x = cell.column * cwidth + Math.floor(cwidth / 2);
                        const y = -cwidth;
                        const sprite = createCandySprite(cell, x, y);
                        if (sprite && scene?.candies)
                            scene.candies.set(cell.id, { id: cell.id, sprite, data: JSON.parse(JSON.stringify(cell)) })
                    })
            }
            if (gameId)
                animationManager.solveSmesh(gameId, data)

        }
    }, [gameEvent, scene])

}
export default useGameViewModel



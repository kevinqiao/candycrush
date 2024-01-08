import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { CellItem } from "../../model/CellItem";
import * as Constant from "../../model/Constants";
import { MOVE_DIRECTION } from "../../model/Constants";
import { GameScene } from "../../model/SceneModel";
import { useBattleManager } from "../../service/BattleManager";
import * as gameEngine from "../../service/GameEngine";
import { useGameManager } from "../../service/GameManager";
import { useSceneManager } from "../../service/SceneManager";
import { ANIMATE_EVENT_TYPE, ANIMATE_NAME } from "../animation/AnimateConstants";
import { useAnimateManager } from "../animation/AnimateManager";
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

const useGameScene = () => {
    const { gameEvent, cells, gameId, status, swapCell, smash } = useGameManager();
    const { battle, loadGame } = useBattleManager();
    const { textures, scenes } = useSceneManager();
    const gameOverRef = useRef<boolean>(false)
    const dragRef = useRef<{ startX: number; startY: number; animation: number, cellId: number }>({ startX: 0, startY: 0, cellId: -1, animation: 0 });
    const { createEvent, createAnimate, checkIfAnimate } = useAnimateManager();
    // console.log(gameEvent)
    const swipe = useCallback((direction: number, candyId: number) => {

        if (!gameId || !cells || checkIfAnimate(gameId)) return
        const gameScene = scenes.get(gameId) as GameScene;
        cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column);
        const cell = cells.find((c: CellItem) => c.id === candyId);
        if (cell) {
            const target = getSwipeTarget(cell, direction, cells);
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
                const candy = gameScene?.candies?.get(ncell.id);
                const tcandy = gameScene?.candies?.get(ntarget.id);
                if (candy && tcandy) {
                    if (gameEngine.checkSwipe(grid)) {
                        createEvent({ name: ANIMATE_NAME.SWIPE_SUCCESS, type: ANIMATE_EVENT_TYPE.CREATE, data: { gameId, candy: ncell, target: ntarget } })
                        // createAnimate({ id: Date.now(), name: ANIMATE_NAME.SWIPE_SUCCESS, gameId, battleId: battle?.id, eles: [], data: { candy: ncell, target: ntarget } })
                        swapCell(ncell.id, ntarget.id)
                    } else {
                        createEvent({ name: ANIMATE_NAME.SWIPE_FAIL, type: ANIMATE_EVENT_TYPE.CREATE, data: { gameId, candyId, targetId: target.id } })
                        // createAnimate({ id: Date.now(), name: ANIMATE_NAME.SWIPE_FAIL, gameId, battleId: battle?.id, eles: [], data: { candyId, targetId: target.id } })
                    }
                }
            }
        }
    }, [gameId, cells, scenes, checkIfAnimate, createAnimate, swapCell])


    const createCandySprite = useCallback((cell: CellItem, x: number, y: number): PIXI.Sprite | null => {
        if (!gameId || !scenes) return null;
        const gameScene = scenes.get(gameId) as GameScene;
        const texture = textures?.find((d) => d.id === cell.asset);
        if (texture && gameScene?.app && gameScene.cwidth) {
            const stage = (gameScene.app as PIXI.Application).stage;
            const sprite = new CandySprite(texture.texture, cell.id, cell.column, cell.row)
            sprite.anchor.set(0.5);
            sprite.width = gameScene.cwidth;
            sprite.height = gameScene.cwidth;
            sprite.x = x;
            sprite.y = y;
            stage.addChild(sprite as PIXI.DisplayObject);
            sprite.eventMode = 'static';
            if (battle?.load !== Constant.BATTLE_LOAD.REPLAY) {
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
                    if (gameOverRef.current) return;
                    const drag = dragRef.current;
                    const deltaX = event.x - drag.startX;
                    const deltaY = event.y - drag.startY;
                    let direction = 0;
                    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10)
                        direction = deltaX > 0 ? MOVE_DIRECTION.RIGHT : MOVE_DIRECTION.LEFT;
                    else if (Math.abs(deltaY) > 10)
                        direction = deltaY > 0 ? MOVE_DIRECTION.DOWN : MOVE_DIRECTION.UP;
                    // console.log("direction:" + direction)
                    if (direction > 0) {
                        swipe(direction, drag.cellId)
                    } else {
                        smash(drag.cellId)
                    }
                });
            }
            return sprite;
        }
        return null;
    }, [gameId, scenes, textures, battle?.type, swipe, smash])

    const initCandies = useCallback((candies: CellItem[]) => {

        if (!gameId || !scenes) return;
        const gameScene = scenes.get(gameId) as GameScene;

        if (gameScene && gameId && gameScene?.candies && gameScene?.cwidth) {
            console.log(gameScene)
            const cwidth = gameScene.cwidth;
            candies.forEach((c) => {
                const x = c.column * cwidth + Math.floor(cwidth / 2);
                const y = c.row * cwidth + Math.floor(cwidth / 2);
                const sprite = createCandySprite(c, x, y);
                if (sprite) {
                    sprite.alpha = 0
                    gameScene.candies?.set(c.id, sprite as CandySprite)
                }
            })
        }
    }, [createCandySprite, gameId, scenes])
    useEffect(() => {
        if (status)
            gameOverRef.current = true;
    }, [status])
    useEffect(() => {

        if (!gameId || !scenes) return;
        const gameScene = scenes.get(gameId) as GameScene;
        if (!gameScene) return
        if (gameEvent?.name === "gameOver") {
            gameOverRef.current = true;
        } else if (gameEvent?.name === "initGame") {

            const game = gameEvent.data;
            console.log(game)
            initCandies(game.cells);
            loadGame(game.gameId, game.matched);
            // const score = gameEngine.countBaseScore(game.matched)
            // createAnimate({
            //     name: ANIMATE_NAME.GAME_INITED, gameId, battleId: battle?.id, data: { load: battle?.load, gameId, uid: game.uid, score },
            //     id: Date.now()
            // })
        } else if (gameEvent?.name === "cellSwapped") {
            const data: { candy: CellItem; target: CellItem; results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] } = gameEvent.data;
            for (let res of data.results) {
                const cwidth = gameScene.cwidth;
                if (cwidth)
                    res.toCreate.forEach((cell: CellItem) => {
                        const x = cell.column * cwidth + Math.floor(cwidth / 2);
                        // const y = -cwidth * (size - cell.row - 1) - Math.floor(cwidth / 2);
                        const y = - Math.floor(cwidth / 2);
                        const sprite = createCandySprite(cell, x, y);
                        if (sprite)
                            gameScene.candies.set(cell.id, sprite as CandySprite)
                    })
            }
            if (gameId) {
                console.log(data)
                createAnimate({ id: Date.now(), name: ANIMATE_NAME.CANDY_SWAPPED, gameId, battleId: battle?.id, data })
            }

        } else if (gameEvent?.name === "cellSmeshed") {
            const data: { candyId: number; results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] } = gameEvent.data;
            for (let res of data.results) {
                const cwidth = gameScene.cwidth;
                if (cwidth)
                    res.toCreate.forEach((cell: CellItem) => {
                        const x = cell.column * cwidth + Math.floor(cwidth / 2);
                        const y = -cwidth;
                        const sprite = createCandySprite(cell, x, y);
                        if (sprite) {
                            gameScene.candies.set(cell.id, sprite as CandySprite)
                        }
                    })
            }
            if (gameId)
                createAnimate({ id: Date.now(), name: ANIMATE_NAME.CANDY_SMESHED, gameId, battleId: battle?.id, data })

        }
    }, [createCandySprite, gameEvent, scenes, gameId, initCandies, createAnimate, battle?.load])

}
export default useGameScene



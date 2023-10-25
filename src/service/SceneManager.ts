import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { CandyModel } from "../model/CandyModel";
import { CellItem } from "../model/CellItem";
import * as Constant from "../model/Constants";
import { MOVE_DIRECTION } from "../model/Constants";
import useAnimationManager from "./AnimationManager";
import * as gameEngine from "./GameEngine";
import { useGameManager } from "./GameManager";

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

const useSceneManager = (scene: PIXI.Application | undefined, textures: { id: number; texture: PIXI.Texture }[] | undefined, pid: string | undefined) => {

    const { isReplay, gameEvent, gameId, lastCellId, findFreeCandies, swapCell } = useGameManager();
    const freeCandiesRef = useRef<CellItem[]>([])
    const dragRef = useRef<{ startX: number; startY: number; cellId: number }>({ startX: 0, startY: 0, cellId: -1 });
    const candyMapRef = useRef(new Map<number, CandyModel>());
    const cellWRef = useRef<number>(0);
    const animationManager = useAnimationManager(candyMapRef, cellWRef, pid);


    useEffect(() => {
        if (gameId && lastCellId > 0)
            findFreeCandies(gameId ?? "0", 50).then((fc) => {
                if (fc) {
                    console.log(fc)
                    freeCandiesRef.current = fc;
                }
            })


    }, [gameId, lastCellId, findFreeCandies]);
    useEffect(() => {
        if (scene?.view)
            cellWRef.current = Math.floor(scene.view.width / Constant.COLUMN);
    }, [scene])
    const startSwipe = useCallback(async (pointer: PointerEvent, cid: number) => {

        const drag = dragRef.current;

        if (drag?.cellId && cid === drag.cellId) {

            const deltaX = pointer.x - drag.startX;
            const deltaY = pointer.y - drag.startY;

            let direction = 0;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10)
                direction = deltaX > 0 ? MOVE_DIRECTION.RIGHT : MOVE_DIRECTION.LEFT;
            else if (Math.abs(deltaY) > 10)
                direction = deltaY > 0 ? MOVE_DIRECTION.DOWN : MOVE_DIRECTION.UP;
            console.log("direction:" + direction)
            if (direction) {

                drag.cellId = -1;
                const cells: CellItem[] = Array.from(candyMapRef.current.values()).map((v) => v.data);
                const candy = cells.find((c) => c.id === cid);

                if (candy) {

                    const target = getSwipeTarget(candy, direction, cells);
                    if (target) {

                        if (gameEngine.checkSwipe(candy.id, target.id, cells)) {
                            // const c = JSON.parse(JSON.stringify(candy));
                            // const t = JSON.parse(JSON.stringify(target));
                            // [c.row, t.row] = [t.row, c.row];
                            // [c.column, t.column] = [t.column, c.column]
                            [candy.row, target.row] = [target.row, candy.row];
                            [candy.column, target.column] = [target.column, candy.column]
                            animationManager.swipeSuccess(candy, target);

                            // const matches = gameEngine.getMatches(cells)
                            // if (matches) {
                            //     const result = gameEngine.processMatches(cells, matches);
                            //     if (result) {
                            //         animationManager.solveMatch(result, 1);
                            //     }
                            // }
                            swapCell(candy.id, target.id);
                        } else {
                            cells.sort((a, b) => {
                                if (a.row !== b.row)
                                    return a.row - b.row
                                else
                                    return a.column - b.column
                            })
                            console.log(cells)
                            animationManager.swipeFail(candy, target)
                        }
                    }

                }

            }
        }
    }, [gameId])

    const createCandySprite = useCallback((cell: CellItem, x: number, y: number): PIXI.Sprite | null => {

        const texture = textures?.find((d) => d.id === cell.asset);
        if (gameId && texture && scene?.stage) {

            const sprite = new PIXI.Sprite(texture.texture);
            sprite.anchor.set(0.5);
            sprite.width = cellWRef.current;
            sprite.height = cellWRef.current;
            sprite.x = x;
            sprite.y = y;
            scene.stage.addChild(sprite);

            sprite.eventMode = 'static';
            if (!isReplay) {
                sprite.on("pointerdown", (event: PointerEvent) => {
                    const drag = dragRef.current;
                    drag.startX = event.x;
                    drag.startY = event.y;
                    drag.cellId = cell.id;
                });
                sprite.on("pointermove", (event: PointerEvent) => startSwipe(event, cell.id));
                sprite.on("pointerup", (event: PointerEvent) => {
                    const drag = dragRef.current;
                    drag.cellId = -1
                });
            }
            return sprite;
        }
        return null;
    }, [isReplay, scene, gameId, startSwipe, textures])

    const initCandies = (cells: CellItem[]) => {
        const cellW = cellWRef.current;
        Array.from(candyMapRef.current.values()).forEach((s) => s.sprite.destroy());
        candyMapRef.current = new Map<number, CandyModel>();
        if (cells)
            cells.forEach((c) => {
                const x = c.column * cellW + Math.floor(cellW / 2);
                const y = c.row * cellW + Math.floor(cellW / 2);
                const sprite = createCandySprite(c, x, y);
                if (sprite)
                    candyMapRef.current.set(c.id, { id: c.id, sprite, data: c })
            })
    }

    useEffect(() => {

        if (gameEvent?.name === "initGame") {
            const { cells } = gameEvent.data;
            initCandies(cells)
        } else if (gameEvent?.name === "cellSwapped") {
            // const { candy, target } = gameEvent.data
            // const c = candyMapRef.current.get(candy.id);
            // if (c?.data.column !== candy.column)
            //     animationManager.swipeSuccess(candy, target)
        } else if (gameEvent?.name === "matchSolved") {

            const cellW = cellWRef.current;
            for (let res of gameEvent.data) {
                const size = res.toCreate.length;
                res.toCreate.forEach((cell: CellItem) => {
                    const x = cell.column * cellW + Math.floor(cellW / 2);
                    const y = -cellW * (size - cell.row) - Math.floor(cellW / 2);
                    const sprite = createCandySprite(cell, x, y);
                    if (sprite)
                        candyMapRef.current.set(cell.id, { id: cell.id, sprite, data: cell })
                })
                console.log(JSON.parse(JSON.stringify(res.toMove)))
                res.toMove.forEach((cell: CellItem) => {
                    const candy = candyMapRef.current.get(cell.id);
                    if (candy) {
                        console.log(JSON.parse(JSON.stringify(candy.data)))
                        console.log(JSON.parse(JSON.stringify(cell)))
                        Object.assign(candy.data, cell)
                    }
                })
            }
            const cells: CellItem[] = Array.from(candyMapRef.current.values()).map((v) => v.data);
            cells.sort((a, b) => {
                if (a.row !== b.row)
                    return a.row - b.row
                else
                    return a.column - b.column
            })
            animationManager.solveMatches(gameEvent.data)
            // for (let i = 0; i < gameEvent.data.length; i++) {
            //     const res = gameEvent.data[i];
            //     setTimeout(() =>
            //         animationManager.solveMatch(res, 1), i * 10 + 10)

            // }
        }
    }, [gameEvent])

}
export default useSceneManager



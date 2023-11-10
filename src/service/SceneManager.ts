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

const useSceneManager = (scene: PIXI.Application | undefined, textures: { id: number; texture: PIXI.Texture }[] | undefined) => {

    const { isReplay, gameEvent, gameId, swapCell, smash } = useGameManager();
    const dragRef = useRef<{ startX: number; startY: number; animation: number, cellId: number }>({ startX: 0, startY: 0, cellId: -1, animation: 0 });
    const candyMapRef = useRef(new Map<number, CandyModel>());
    const cellWRef = useRef<number>(0);
    const animationManager = useAnimationManager(textures, candyMapRef, cellWRef);


    useEffect(() => {
        if (scene?.view)
            cellWRef.current = Math.floor(scene.view.width / Constant.COLUMN);
    }, [scene])
    const log = () => {
        const cells: CellItem[] = Array.from(candyMapRef.current.values()).map((v) => v.data);
        cells.sort((a, b) => {
            if (a.row !== b.row)
                return a.row - b.row
            else
                return a.column - b.column
        })
        console.log(JSON.parse(JSON.stringify(cells)))
    }
    const swipe = (direction: number, candyId: number) => {
        const cells: CellItem[] = Array.from(candyMapRef.current.values()).map((v) => v.data);
        const candy = cells.find((c) => c.id === candyId);

        if (candy) {

            const target = getSwipeTarget(candy, direction, cells);
            if (target) {
                if (gameEngine.checkSwipe(candy.id, target.id, cells)) {
                    // animationManager.startSwipe(candy, target);
                    swapCell(candy.id, target.id)
                } else {
                    cells.sort((a, b) => {
                        if (a.row !== b.row)
                            return a.row - b.row
                        else
                            return a.column - b.column
                    })
                    console.log(cells)
                    animationManager.cancelSwipe(candy, target)
                }
            }

        }
    }


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
                        console.log(cell)
                        swipe(direction, drag.cellId)
                    } else {
                        console.log("smash happend")
                        smash(drag.cellId)
                    }
                    // drag.cellId = -1
                });
            }
            return sprite;
        }
        return null;
    }, [isReplay, scene, gameId, textures])

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
        console.log(gameEvent)
        if (gameEvent?.name === "initGame") {
            const { cells } = gameEvent.data;
            initCandies(JSON.parse(JSON.stringify(cells)))
        } else if (gameEvent?.name === "cellSwapped") {
            // log();
            const cellW = cellWRef.current;
            const data: { candy: CellItem; target: CellItem; results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] } = gameEvent.data;

            for (let res of data.results) {
                const size = res.toCreate.length;
                res.toCreate.forEach((cell: CellItem) => {
                    const x = cell.column * cellW + Math.floor(cellW / 2);
                    const y = -cellW * (size - cell.row) - Math.floor(cellW / 2);
                    const sprite = createCandySprite(cell, x, y);
                    if (sprite)
                        candyMapRef.current.set(cell.id, { id: cell.id, sprite, data: JSON.parse(JSON.stringify(cell)) })
                })
            }
            animationManager.solveSwipe(data)
        } else if (gameEvent?.name === "cellSmeshed") {
            const data: { candy: CellItem; target: CellItem; results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] } = gameEvent.data;
            const cellW = cellWRef.current;
            for (let res of data.results) {
                res.toCreate.forEach((cell: CellItem) => {
                    const x = cell.column * cellW + Math.floor(cellW / 2);
                    const y = -cellW;
                    const sprite = createCandySprite(cell, x, y);
                    if (sprite)
                        candyMapRef.current.set(cell.id, { id: cell.id, sprite, data: cell })
                })
            }
            animationManager.solveSmesh(gameEvent.data)
        }
    }, [gameEvent])

}
export default useSceneManager



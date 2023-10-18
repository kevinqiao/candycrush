import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { CandyModel } from "../model/CandyModel";
import { CellItem } from "../model/CellItem";
import * as Constant from "../model/Constants";
import { MOVE_DIRECTION } from "../model/Constants";
import * as gameEngine from "../service/GameEngine";
import useAnimationManager from "./AnimationManager";
import { useGameManager } from "./GameManager";
import { useUserManager } from "./UserManager";



const useSceneManager = (scene: PIXI.Application | undefined, textures: { id: number; texture: PIXI.Texture }[] | undefined, pid: string | undefined) => {
    const cellsRef = useRef<CellItem[] | null>(null)
    const { isReplay, uid, gameId, cells, gameEvent, swapCell } = useGameManager();
    const { user } = useUserManager();
    const dragRef = useRef<{ startX: number; startY: number; cellId: number }>({ startX: 0, startY: 0, cellId: -1 });
    const candyMapRef = useRef(new Map<number, CandyModel>());
    const cellW = scene ? Math.floor(scene.view.width / Constant.COLUMN) : 0;
    const animationManager = useAnimationManager(candyMapRef, cellW, pid);
    cellsRef.current = cells;
    const startSwipe = useCallback(async (pointer: PointerEvent, cid: number) => {
        // const cells = cellsRef.current;
        const drag = dragRef.current;

        if (cellsRef.current && drag?.cellId && cid === drag.cellId) {

            const deltaX = pointer.x - drag.startX;
            const deltaY = pointer.y - drag.startY;

            let direction = 0;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10)
                direction = deltaX > 0 ? MOVE_DIRECTION.RIGHT : MOVE_DIRECTION.LEFT;
            else if (Math.abs(deltaY) > 10)
                direction = deltaY > 0 ? MOVE_DIRECTION.DOWN : MOVE_DIRECTION.UP;


            if (direction) {

                // console.log(JSON.parse(JSON.stringify({ pid, cells })))
                drag.cellId = -1;
                const candy = cellsRef.current?.find((c: CellItem) => c.id === cid);
                // console.log(candy)
                if (candy) {

                    const target = gameEngine.getSwipeTarget(candy, direction, cellsRef.current);
                    if (target) {

                        if (gameEngine.checkSwipe(candy.id, target.id, cellsRef.current)) {
                            const c = JSON.parse(JSON.stringify(candy));
                            const t = JSON.parse(JSON.stringify(target));
                            [c.row, t.row] = [t.row, c.row];
                            [c.column, t.column] = [t.column, c.column]
                            animationManager.swipeSuccess(c, t)
                            swapCell(candy.id, target.id);
                        } else {
                            animationManager.swipeFail(candy, target)
                        }
                    }

                }

            }
        }
    }, [cells])
    const createCandySprite = useCallback((cell: CellItem, x: number, y: number): PIXI.Sprite | null => {

        const texture = textures?.find((d) => d.id === cell.asset);
        if (texture && scene?.stage) {

            const sprite = new PIXI.Sprite(texture.texture);
            sprite.anchor.set(0.5);
            sprite.width = cellW;
            sprite.height = cellW;
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
    }, [cells, cellW, scene, startSwipe, textures])

    const initGame = () => {

        Array.from(candyMapRef.current.values()).forEach((s) => s.sprite.destroy());
        candyMapRef.current = new Map<number, CandyModel>();
        if (cells)
            cells.forEach((c) => {
                const x = c.column * cellW + Math.floor(cellW / 2);
                const y = c.row * cellW + Math.floor(cellW / 2);
                const sprite = createCandySprite(c, x, y);
                if (sprite)
                    candyMapRef.current.set(c.id, { id: c.id, sprite })
            })
    }

    useEffect(() => {


        if (gameEvent?.name === "cellSwapped") {
            const { candy, target } = gameEvent.data
            animationManager.swipeSuccess(candy, target)
        } else if (gameEvent?.name === "matchSolved") {
            let count = 0;
            console.log(uid + ":" + user?.uid)
            for (let res of gameEvent.data) {
                // if (isReplay || !user || user.uid !== uid)
                //     count++;
                // const res: { direction: number; toCreate: CellItem[] } = gameEvent.data;
                const size = res.toCreate.length;
                res.toCreate.forEach((cell: CellItem) => {
                    const x = cell.column * cellW + Math.floor(cellW / 2);
                    const y = -cellW * (size - cell.row) - Math.floor(cellW / 2);
                    const sprite = createCandySprite(cell, x, y);
                    if (sprite)
                        candyMapRef.current.set(cell.id, { id: cell.id, sprite })
                })
                setTimeout(() =>
                    animationManager.solveMatch(res, 1), count * 300 + 10)
                count++
            }
        }
    }, [gameEvent])

    useEffect(() => {
        if (scene && gameId) {
            initGame()
        }

    }, [scene, gameId])


}
export default useSceneManager



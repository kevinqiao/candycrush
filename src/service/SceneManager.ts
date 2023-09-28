import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { CandyModel } from "../model/CandyModel";
import { CellItem } from "../model/CellItem";
import { MOVE_DIRECTION } from "../model/Constants";
import { GameModel } from "../model/GameModel";
import useAnimationManager from "./AnimationManager";
import useCoord from "./CoordManager";
import useEventSubscriber from "./EventManager";
import * as gameEngine from "./GameEngine";


const useSceneManager = (game: GameModel | null, swapCell: Function, scene: PIXI.Application | undefined, textures: { id: number; texture: PIXI.Texture }[] | undefined) => {
    const { event } = useEventSubscriber(["pause", "gameInited", "gameSync", "matchSolved", "candySwapped"], ["animation"]);
    const gameInitedRef = useRef<boolean>(false)
    const dragRef = useRef<{ startX: number; startY: number; cellId: number }>({ startX: 0, startY: 0, cellId: -1 });
    const candyMapRef = useRef(new Map<number, CandyModel>());
    const matchingRef = useRef(0);
    const { cellW } = useCoord();
    // const { game, swapCell } = useGameManager({ gameId, playMode });
    const animationManager = useAnimationManager(candyMapRef, game ?? null);

    const startSwipe = useCallback(async (pointer: PointerEvent, cid: number) => {



        const drag = dragRef.current;

        if (game && drag?.cellId && cid === drag.cellId) {

            const deltaX = pointer.x - drag.startX;
            const deltaY = pointer.y - drag.startY;

            let direction = 0;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20)
                direction = deltaX > 0 ? MOVE_DIRECTION.RIGHT : MOVE_DIRECTION.LEFT;
            else if (Math.abs(deltaY) > 20)
                direction = deltaY > 0 ? MOVE_DIRECTION.DOWN : MOVE_DIRECTION.UP;


            if (direction) {
                const cells = game.cells;
                drag.cellId = -1;
                const candy = cells.find((c: CellItem) => c.id === cid);
                if (candy) {
                    const target = gameEngine.getSwipeTarget(candy, direction, cells);
                    if (target) {
                        console.log(cells)
                        if (gameEngine.checkSwipe(candy.id, target.id, cells)) {
                            const c = JSON.parse(JSON.stringify(candy));
                            const t = JSON.parse(JSON.stringify(target));
                            [c.row, t.row] = [t.row, c.row];
                            [c.column, t.column] = [t.column, c.column]
                            animationManager.swipeSuccess(c, t)
                            const results = await swapCell(candy.id, target.id, cells);
                            // if (results)
                            //     animationManager.solveMatch(results, 0)
                        } else {
                            animationManager.swipeFail(candy, target)
                        }
                    }

                }

            }
        }
    }, [animationManager, game, swapCell])
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
            return sprite;
        }
        return null;
    }, [cellW, scene, startSwipe, textures])

    const initGame = () => {

        Array.from(candyMapRef.current.values()).forEach((s) => s.sprite.destroy());
        candyMapRef.current = new Map<number, CandyModel>()
        game?.cells.forEach((c) => {
            const x = c.column * cellW + Math.floor(cellW / 2);
            const y = c.row * cellW + Math.floor(cellW / 2);
            const sprite = createCandySprite(c, x, y);
            if (sprite)
                candyMapRef.current.set(c.id, { id: c.id, sprite })
        })
    }

    useEffect(() => {
        if (event?.name === "pause") {
            matchingRef.current = 1;
        } else if (event?.name === "gameInited") {
            initGame();
            gameInitedRef.current = true;
        } else if (event?.name === "matchSolved") {

            const res: { direction: number; toCreate: CellItem[] } = event.data;
            const size = res.toCreate.length;
            res.toCreate.forEach((cell, index) => {
                const x = cell.column * cellW + Math.floor(cellW / 2);
                const y = -cellW * (size - cell.row) - Math.floor(cellW / 2);
                const sprite = createCandySprite(cell, x, y);
                if (sprite)
                    candyMapRef.current.set(cell.id, { id: cell.id, sprite })
            })
            animationManager.solveMatch(event.data, 1)
        }
    }, [event])
    useEffect(() => {
        if (gameInitedRef.current) {
            initGame()
            console.log("reinit game")
        }

    }, [scene])

}
export default useSceneManager



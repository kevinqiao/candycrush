import useAct from "component/animation/game/useAct";
import useEvent from "component/animation/game/useEvent";
import useSkill from "component/animation/game/useSkill";
import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { CellItem } from "../../model/CellItem";
import * as Constant from "../../model/Constants";
import { MOVE_DIRECTION } from "../../model/Constants";
import { GameScene } from "../../model/SceneModel";
import { useBattleManager } from "../../service/BattleManager";
import { useGameManager } from "../../service/GameManager";
import { useSceneManager } from "../../service/SceneManager";
import { CandySprite } from "../pixi/CandySprite";
const useGameScene = () => {

    const { gameEvent, game, doAct } = useGameManager();
    const { battle, loadGame, skill, setSkill } = useBattleManager();
    const skillRef = useRef<number>(skill)
    const { load, textures, scenes } = useSceneManager();
    const { playApply } = useEvent();
    const { swipeAct, hitAct } = useAct();
    const { swapSelect, resetSkill, executeSkill } = useSkill();
    const selectedCandyRef = useRef<CandySprite[]>([]);

    const createCandySprite = useCallback((cell: CellItem, x: number, y: number): PIXI.Sprite | null => {
        if (!game?.gameId || !scenes) return null;
        const gameScene = scenes.get(game.gameId) as GameScene;
        const texture = textures?.find((d) => d.id === cell.asset);

        if (texture && gameScene?.app && gameScene.cwidth) {
            // console.log("exactly create candy sprite")
            const stage = (gameScene.app as PIXI.Application).stage;
            const sprite = new CandySprite(texture.texture, cell.id, cell.asset, cell.column, cell.row)
            sprite.anchor.set(0.5);
            sprite.width = gameScene.cwidth;
            sprite.height = gameScene.cwidth;
            sprite.x = x;
            sprite.y = y;
            sprite.eventMode = 'static';
            if (load !== Constant.BATTLE_LOAD.REPLAY) {
                sprite.on("pointerdown", (event: any) => {
                    selectedCandyRef.current.push(sprite);
                });
            }
            stage.addChild(sprite as PIXI.DisplayObject);
            return sprite;
        }
        return null;
    }, [game, scenes, textures, battle?.type, doAct])

    const initCandies = useCallback((candies: CellItem[]) => {

        if (!game || !game?.gameId || !scenes) return;
        const gameScene = scenes.get(game.gameId) as GameScene;
        if (gameScene && game.gameId && gameScene?.candies && gameScene?.cwidth) {

            const cwidth = gameScene.cwidth;
            candies.forEach((c) => {
                const x = c.column * cwidth + Math.floor(cwidth / 2);
                const y = c.row * cwidth + Math.floor(cwidth / 2);
                const sprite = createCandySprite(c, x, y);
                if (sprite) {
                    sprite.alpha = 1
                    gameScene.candies?.set(c.id, sprite as CandySprite)
                }
            })
        }
    }, [createCandySprite, game, scenes])

    const handleDrag = useCallback((direction: number) => {

        const candySprite = selectedCandyRef.current;
        if (!game || !battle) return;
        const { column, row } = battle.data;
        const selecteds: CandySprite[] = selectedCandyRef.current;
        if (!skillRef.current) {
            if (direction > 0) {
                const c = direction === 2 || direction === 4 ? selecteds[0]['column'] : (direction === 1 ? selecteds[0]['column'] + 1 : selecteds[0]['column'] - 1);
                const r = direction === 1 || direction === 3 ? selecteds[0]['row'] : (direction === 2 ? selecteds[0]['row'] + 1 : selecteds[0]['row'] - 1);
                if (c >= 0 && c < column && r >= 0 && r < row) {
                    const candy = game.data.cells.find((cell: CellItem) => candySprite[0].id === cell.id);
                    const target = game.data.cells.find((cell: CellItem) => cell.column === c && cell.row === r)
                    if (candy && target)
                        swipeAct(candy, target)
                }
            } else {
                hitAct(selecteds[0])
            }
            selectedCandyRef.current.length = 0;

        } else {
            switch (skillRef.current) {
                case 1:
                    if (selecteds.length === 1) {
                        console.log("use skill hammer")
                        // doAct(Constant.GAME_ACTION.SKILL_HAMMER, { candyId: selecteds[0].id })
                        executeSkill(1, { candyId: selecteds[0].id })
                        setSkill(0)
                    }
                    break;
                case 2:
                    if (selecteds.length === 1) {
                        swapSelect(selecteds[0])
                    } else if (selecteds.length === 2) {
                        console.log("use skill swap")
                        // doAct(Constant.GAME_ACTION.SKILL_SWAP, { candyId: selecteds[0].id, targetId: selecteds[1].id })
                        executeSkill(2, { candyId: selecteds[0].id, targetId: selecteds[1].id })
                        setSkill(0)
                    }
                    break;
                case 3:
                    if (selecteds.length === 1) {
                        console.log("use skill spray")
                        // doAct(Constant.GAME_ACTION.SKILL_SPRAY, { candyId: selecteds[0].id})
                        executeSkill(3, { candyId: selecteds[0].id })
                        setSkill(0)
                    }
                    break;

                default:
                    break;
            }

        }

    }, [game, battle, doAct])
    useEffect(() => {

        if (!game || !game?.gameId || !scenes) return;
        const gameScene = scenes.get(game.gameId) as GameScene;
        if (!gameScene) return

        if (gameEvent?.name === "initGame") {
            Array.from(gameScene.candies.values()).forEach((c) => c.destroy())
            gameScene.candies.clear();
            const g = gameEvent.data;
            // console.log("init candies for game:" + game.gameId)
            initCandies(g.data.cells);
            loadGame(game.gameId, { matched: game.data.matched ?? [] });
            // loadGame(game.uid, game.gameId, { data: { matched: game.data.matched } });
        } else if (gameEvent?.name === "cellSwapped" || gameEvent?.name === "cellSmeshed" || gameEvent?.name === "skillHammer" || gameEvent?.name === "skillSwap" || gameEvent?.name === "skillSpray") {
            const data: { candy: CellItem; target: CellItem; results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[] } = gameEvent.data;
            if (!data?.results) return
            for (const res of data.results) {
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
            playApply(gameEvent)
        }

    }, [load, gameEvent, scenes, initCandies])
    useEffect(() => {

        if (skill === 0 && selectedCandyRef.current.length > 0) {
            selectedCandyRef.current.forEach((c) => c.alpha = 1);
            selectedCandyRef.current.length = 0;
            resetSkill();
        }
        skillRef.current = skill;
    }, [skill])

    useEffect(() => {
        if (scenes && game?.gameId) {
            const gameScene = scenes.get(game.gameId) as GameScene;
            if (gameScene?.app) {
                const app = gameScene.app as PIXI.Application;
                let startX = 0;
                let startY = 0;
                if (app.view.addEventListener) {
                    app.view.addEventListener('pointerdown', (event) => {
                        if (event instanceof PointerEvent) {
                            startX = event.clientX;
                            startY = event.clientY;
                        }
                    });
                    app.view.addEventListener('pointerup', (event) => {
                        const pevent = event as PointerEvent;
                        const deltaX = pevent.clientX - startX;
                        const deltaY = pevent.clientY - startY;
                        let direction = 0;
                        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10)
                            direction = deltaX > 0 ? MOVE_DIRECTION.RIGHT : MOVE_DIRECTION.LEFT;
                        else if (Math.abs(deltaY) > 10)
                            direction = deltaY > 0 ? MOVE_DIRECTION.DOWN : MOVE_DIRECTION.UP;
                        handleDrag(direction)
                    });

                }
            }
        }
    }, [scenes, game])
}
export default useGameScene



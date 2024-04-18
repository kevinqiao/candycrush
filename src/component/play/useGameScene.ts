import { useAnimation } from "component/animation/battle/useAnimation";
import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { useUserManager } from "service/UserManager";
import { hasMatch3 } from "util/MatchGameUtils";
import { CellItem } from "../../model/CellItem";
import * as Constant from "../../model/Constants";
import { MOVE_DIRECTION } from "../../model/Constants";
import { GameScene } from "../../model/SceneModel";
import { useBattleManager } from "../../service/BattleManager";
import { useGameManager } from "../../service/GameManager";
import { useSceneManager } from "../../service/SceneManager";
import { CandySprite } from "../pixi/CandySprite";

// const getSwipeTarget = (cellItem: CellItem, direction: number, cells: CellItem[]): CellItem | undefined => {
//     let target;
//     if (cellItem) {
//         switch (direction) {
//             //right move
//             case MOVE_DIRECTION.RIGHT:
//                 target = cells.find((c) => c.row === cellItem.row && c.column === cellItem.column + 1);
//                 break;
//             //down move
//             case MOVE_DIRECTION.DOWN:
//                 target = cells.find((c) => c.row === cellItem.row + 1 && c.column === cellItem.column);
//                 break;
//             //left move
//             case MOVE_DIRECTION.LEFT:
//                 target = cells.find((c) => c.row === cellItem.row && c.column === cellItem.column - 1);
//                 break;
//             //up move
//             case MOVE_DIRECTION.UP:
//                 target = cells.find((c) => c.row === cellItem.row - 1 && c.column === cellItem.column);
//                 break;
//             default:
//                 break;
//         }
//     }
//     return target;
// }

const useGameScene = () => {

    const { user } = useUserManager();
    const { gameEvent, game, doAct } = useGameManager();
    const { battle, loadGame, skill, setSkill } = useBattleManager();
    const skillRef = useRef<number>(skill)
    const { load, textures, scenes } = useSceneManager();
    const { playSwipeFail, playSwipeSuccess, playCandyMatch } = useAnimation();
    const selectedCandyRef = useRef<CandySprite[]>([]);

    // const swipe = useCallback((direction: number, candyId: number) => {

    //     if (!battle || !game?.gameId || !game?.data.cells) return
    //     const gameScene = scenes.get(game.gameId) as GameScene;
    //     game.data.cells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column);
    //     const cell = game.data.cells.find((c: CellItem) => c.id === candyId);

    //     if (cell) {
    //         const target = getSwipeTarget(cell, direction, game.data.cells);
    //         if (target) {
    //             const ncells: CellItem[] = JSON.parse(JSON.stringify(game.data.cells));
    //             const ncell: CellItem | undefined = ncells.find((c: CellItem) => c.id === cell.id);
    //             const ntarget: CellItem | undefined = ncells.find((c: CellItem) => c.id === target.id);
    //             if (!ncell || !ntarget) return;
    //             [ncell.row, ntarget.row] = [ntarget.row, ncell.row];
    //             [ncell.column, ntarget.column] = [ntarget.column, ncell.column];
    //             ncells.sort((a: CellItem, b: CellItem) => a.row !== b.row ? a.row - b.row : a.column - b.column)

    //             const candy = gameScene?.candies?.get(ncell.id);
    //             const tcandy = gameScene?.candies?.get(ntarget.id);
    //             if (candy && tcandy) {
    //                 const { row, column } = battle.data
    //                 const grid: CellItem[][] = Array.from({ length: row }, () => Array(column).fill(null));
    //                 for (const unit of ncells) {
    //                     grid[unit.row][unit.column] = unit;
    //                 }
    //                 const smeshIds = [28, 29, 30, 31]
    //                 if (smeshIds.includes(cell['asset']) || smeshIds.includes(target['asset']) || checkSwipe(grid)) {
    //                     playSwipeSuccess(game.gameId, ncell, ntarget, null)
    //                     doAct(Constant.GAME_ACTION.SWIPE_CANDY, { candyId: ncell.id, targetId: ntarget.id })
    //                 } else {
    //                     playSwipeFail(game.gameId, candyId, target.id, null)
    //                 }
    //             }
    //         }
    //     }
    // }, [game, battle, scenes, doAct])



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
                    selectedCandyRef.current.push(sprite)
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
        console.log("handle drag")
        const candySprite = selectedCandyRef.current;
        if (!game || !candySprite || !battle) return;
        const { column, row } = battle.data;
        const selecteds: CandySprite[] = selectedCandyRef.current;
        if (!skillRef.current) {

            if (direction > 0) {
                const c = direction === 2 || direction === 4 ? selecteds[0]['column'] : (direction === 1 ? selecteds[0]['column'] + 1 : selecteds[0]['column'] - 1);
                const r = direction === 1 || direction === 3 ? selecteds[0]['row'] : (direction === 2 ? selecteds[0]['row'] + 1 : selecteds[0]['row'] - 1);
                if (c >= 0 && c < column && r >= 0 && r < row) {
                    const candy = game.data.cells.find((cell: CellItem) => candySprite[0].id === cell.id);
                    const target = game.data.cells.find((cell: CellItem) => cell.column === c && cell.row === r)

                    if (candy && target) {
                        [candy.row, target.row] = [target.row, candy.row];
                        [candy.column, target.column] = [target.column, candy.column];
                        const smeshIds = [28, 29, 30, 31];
                        const grid: CellItem[][] = Array.from({ length: row }, () => Array(column).fill(null));
                        for (const unit of game.data.cells) {
                            grid[unit.row][unit.column] = unit;
                        }
                        if (hasMatch3(grid) || smeshIds.includes(candy['asset']) || smeshIds.includes(target['asset'])) {
                            playSwipeSuccess(game.gameId, candy, target, null)
                            // doAct(Constant.GAME_ACTION.SWIPE_CANDY, { candyId: candy.id, targetId: target.id })
                        } else {
                            playSwipeFail(game.gameId, candy.id, target.id, null);
                            [candy.row, target.row] = [target.row, candy.row];
                            [candy.column, target.column] = [target.column, candy.column];
                        }
                        console.log("execute action:swipe")
                        // doAct(Constant.GAME_ACTION.SWIPE_CANDY, { candyId: selecteds[0].id, targetId: target.id })
                    }
                }
            } else {
                console.log("execute action:smash")
                // doAct(Constant.GAME_ACTION.SMASH_CANDY, { candyId: selecteds[0].id })
            }
            selectedCandyRef.current.length = 0;

        } else {
            switch (skillRef.current) {
                case 1:
                    if (selecteds.length === 1) {
                        console.log("use skill hammer")
                        // doAct(Constant.GAME_ACTION.SKILL_HAMMER, { candyId: selecteds[0].id })
                        setSkill(0)
                    }
                    break;
                case 2:
                    if (selecteds.length === 1) {
                        selecteds[0].alpha = 0.5
                        console.log("select first candy for skill swap")
                    } else if (selecteds.length === 2) {
                        console.log("use skill swap")
                        // doAct(Constant.GAME_ACTION.SKILL_SWAP, { candyId: selecteds[0].id, targetId: selecteds[1].id })
                        setSkill(0)
                    }
                    break;
                case 3:
                    if (selecteds.length === 1) {
                        console.log("use skill spray")
                        // doAct(Constant.GAME_ACTION.SKILL_SPRAY, { candyId: selecteds[0].id, targetId: selecteds[1].id })
                        setSkill(0)
                    }
                    break;

                default:
                    break;
            }

        }

    }, [doAct])
    useEffect(() => {

        if (!game || !game?.gameId || !scenes) return;
        const gameScene = scenes.get(game.gameId) as GameScene;
        if (!gameScene) return

        if (gameEvent?.name === "initGame") {
            // console.log(gameEvent)
            Array.from(gameScene.candies.values()).forEach((c) => c.destroy())
            gameScene.candies.clear();
            const g = gameEvent.data;
            // console.log("init candies for game:" + game.gameId)
            initCandies(g.data.cells);
            loadGame(game.gameId, { matched: game.data.matched ?? [] });
            // loadGame(game.uid, game.gameId, { data: { matched: game.data.matched } });
        } else if (gameEvent?.name === "cellSwapped" || gameEvent?.name === "cellSmeshed" || gameEvent?.name === "skillHammer") {
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
            const eventName = gameEvent.name;

            switch (eventName) {
                case "cellSwapped":
                    if (game.uid !== user.uid || load === Constant.BATTLE_LOAD.REPLAY) {
                        const tl = gsap.timeline({
                            onComplete: () => {
                                tl.kill();
                            }
                        });
                        const sl = gsap.timeline();
                        tl.add(sl, "<")
                        playSwipeSuccess(game.gameId, data.candy, data.target, null);
                        const ml = gsap.timeline();
                        tl.add(ml, ">")
                        playCandyMatch(game.gameId, data, ml)
                    } else
                        playCandyMatch(game.gameId, data, null)
                    break;
                case "cellSmeshed":
                    playCandyMatch(game.gameId, data, null)
                    break;
                case "skillHammer":
                    playCandyMatch(game.gameId, data, null)
                    break;
                default:
                    break;
            }

        }

    }, [load, gameEvent, scenes, initCandies])
    useEffect(() => {
        skillRef.current = skill;
        if (skill === 0 && selectedCandyRef.current.length > 0) {
            selectedCandyRef.current.forEach((c) => c.alpha = 1);
            selectedCandyRef.current.length = 0;
        }
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
                        console.log("direction:" + direction)
                        handleDrag(direction)
                    });

                }
            }
        }
    }, [scenes, game])


}
export default useGameScene



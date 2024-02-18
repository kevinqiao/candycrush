import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { useBattleManager } from "service/BattleManager";
import { useGameManager } from "service/GameManager";
import { CellItem } from "../../../model/CellItem";
import { SCENE_NAME } from "../../../model/Constants";
import { ConsoleScene, GameScene, SceneModel } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import * as GameUtils from "../../../util/MatchGameUtils";
import useBattleBoard from "./useBattleBoard";
const useCollectCandies = () => {
    const prematchedRef = useRef<any>(null)
    const { battle } = useBattleManager();
    const { game } = useGameManager();
    const { scenes, textures } = useSceneManager();
    const { changeGoal, changeScore } = useBattleBoard();
    useEffect(() => {
        if (game?.data.matched) {
            prematchedRef.current = JSON.parse(JSON.stringify(game.data.matched));
        }
    }, [game])
    const getGoalTarget = (gameId: string, asset: number) => {

        const ground = scenes.get(SCENE_NAME.BATTLE_GROUND);

        const consoleScene = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;

        if (ground && consoleScene) {
            const panel = consoleScene.goalPanels.find((p) => p.gameId === gameId);

            if (panel) {

                const goal = panel.goals.find((g) => g.asset === asset);

                if (goal?.iconEle) {
                    const goalBound = (goal.iconEle as HTMLElement).getBoundingClientRect();
                    const groundBound = (ground.app as HTMLDivElement).getBoundingClientRect();
                    if (goalBound && groundBound) {
                        const x = goalBound.left - groundBound.left;
                        const y = goalBound.top - groundBound.top;
                        return { x, y }
                    }
                }
            }
        }
        return null;

    }
    const playCollect = useCallback((gameId: string, result: any, timeline: any) => {

        const gameScene: GameScene | undefined = scenes.get(gameId) as GameScene;
        const battleScene: SceneModel | undefined = scenes.get(SCENE_NAME.BATTLE_SCENE);

        if (battle && result.toRemove?.length > 0 && gameScene && battleScene && textures && gameScene?.cwidth) {
            const pre = prematchedRef.current ?? [];
            const cwidth = gameScene?.cwidth;

            if (game?.data.matched && cwidth) {
                const tl = timeline ?? gsap.timeline();
                prematchedRef.current = JSON.parse(JSON.stringify(game.data.matched));
                const sl = gsap.timeline();
                tl.add(sl);
                const scoreFrom = GameUtils.countBaseScore(pre);
                const scoreTo = GameUtils.countBaseScore(prematchedRef.current)
                changeScore(gameId, { from: scoreFrom, to: scoreTo }, sl)
                const { goal } = battle.data;
                const goalChanges = GameUtils.solveGoalChanges(goal, pre, prematchedRef.current);

                if (goalChanges?.length > 0) {

                    result.toRemove.forEach((cell: CellItem) => {
                        const target = getGoalTarget(gameId, cell.asset);
                        const texture = textures?.find((d) => d.id === cell.asset);
                        if (texture && target) {
                            const cl = gsap.timeline();
                            tl.add(cl, "<");
                            const sprite = new PIXI.Sprite(texture.texture);
                            sprite.anchor.set(0.5);
                            sprite.width = cwidth;
                            sprite.height = cwidth;
                            const x = gameScene.x + cell.column * cwidth + Math.floor(cwidth / 2);
                            const y = gameScene.y + cwidth * cell.row + Math.floor(cwidth / 2);
                            sprite.x = x;
                            sprite.y = y;
                            sprite.alpha = 0;
                            const controlPoint = { x: x + 20, y: y - cwidth };
                            (battleScene.app as PIXI.Application).stage.addChild(sprite as PIXI.DisplayObject);
                            // const target = { x: battleScene.x + 100, y: 100 }
                            cl.to(sprite, {
                                alpha: 1,
                                x: controlPoint.x,
                                y: controlPoint.y,
                                duration: 2,
                                ease: 'circ.out',
                            })

                            cl.to(sprite, {
                                x: target.x,
                                y: target.y,
                                duration: 0.9,
                                ease: 'circ.in',

                            }, ">").to(sprite.scale, { duration: 0.9, x: 0, y: 0, ease: 'circ.in' }, "<");

                        }
                    });
                    const gl = gsap.timeline();
                    tl.add(gl, ">");
                    changeGoal(gameId, goalChanges, gl)
                }

                if (!timeline)
                    tl.play();
            }
        }
    }, [game, battle])
    return { playCollect }


}
export default useCollectCandies
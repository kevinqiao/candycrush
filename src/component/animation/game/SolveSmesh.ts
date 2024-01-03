import { gsap } from "gsap";
import { useCallback } from "react";
import { GameScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import { IAnimateContext, IAnimateHandleContext } from "../AnimateManager";
import useBattleBoard from "../battle/BattleBoard";
import useCollectCandies from "../battle/CollectCandies";
import { playChange, playMove, playRemove } from "./ApplyMatch";

const useSolveSmesh = (props: IAnimateHandleContext) => {
    const { scenes, textures } = useSceneManager();
    const { animates } = props;
    const { playCollect } = useCollectCandies();
    const { changeGoal, changeScore } = useBattleBoard()
    const solveMesh = useCallback(
        (gameId: string, data: any, timeline: any) => {
            const tl = timeline ?? gsap.timeline();
            const { results } = data;
            // console.log(results)
            if (results) {
                const gameScene: GameScene = scenes.get(gameId) as GameScene;
                for (const res of results) {
                    const ml = gsap.timeline();
                    tl.add(ml, ">");
                    const cl = gsap.timeline();
                    ml.add(cl)
                    if (res.toChange)
                        playChange(res.toChange, gameScene, textures, cl);
                    if (res.toRemove) {
                        playRemove(res.toRemove, gameScene, textures, cl)

                        cl.call(
                            () => {
                                // createAnimate({ id: Date.now(), name: ANIMATE_NAME.GOAL_COLLECT, data: { gameId, cells: res.toRemove, goal: res.toGoal } })
                                const gl = gsap.timeline();
                                playCollect(gameId, res, gl);
                                if (res.toGoal && res.toGoal.length > 0) {
                                    // tl.add(gl, ">")
                                    changeGoal(gameId, res.toGoal, gl)
                                }
                                gl.play();
                            },
                            [],
                            "<"
                        );
                    }
                    if (res.toMove) {
                        const mt = gsap.timeline();
                        ml.add(mt, "<")
                        playMove(res.toMove, gameScene, textures, mt)
                    }
                    if (res.toScore) {
                        const st = gsap.timeline();
                        ml.add(st, "<")
                        changeScore(st, { gameId, ...res.toScore })
                    }
                }
            }
            if (!timeline)
                tl.play();
            else
                timeline.add(tl)
        },
        [animates, changeGoal, playCollect, scenes, textures]
    );


    return { solveMesh };
};
export default useSolveSmesh




import { gsap } from "gsap";
import { useCallback } from "react";

import { GameScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import { IAnimateContext, IAnimateHandleContext } from "../AnimateManager";
import useBattleBoard from "../battle/BattleBoard";
import useCollectCandies from "../battle/CollectCandies";
import { playChange, playMove, playRemove } from "./ApplyMatch";
import useSwipeCandy from "./SwipeCandy";

const useSolveSwap = (props: IAnimateHandleContext) => {
    const { animates } = props;
    const { scenes, textures } = useSceneManager();
    const { swipeSuccess } = useSwipeCandy(props);
    const { changeGoal, changeScore } = useBattleBoard()
    const { playCollect } = useCollectCandies();


    const solveSwap = useCallback(
        (gameId: string, data: any, timeline: any) => {
            const gameScene: GameScene = scenes.get(gameId) as GameScene;
            const tl = timeline ?? gsap.timeline()


            const { candy, target, results } = data;
            swipeSuccess(gameId, candy, target, tl);
            if (results) {

                for (const res of results) {
                    const ml = gsap.timeline();
                    tl.add(ml, ">");
                    const cl = gsap.timeline();
                    ml.add(cl)

                    if (res.toChange) {
                        playChange(res.toChange, gameScene, textures, cl);
                    }
                    if (res.toRemove) {
                        playRemove(res.toRemove, gameScene, textures, cl)
                        cl.call(
                            () => {
                                const rl = gsap.timeline();
                                playCollect(gameId, res, rl);
                                if (res.toGoal && res.toGoal.length > 0) {
                                    const gl = gsap.timeline();
                                    rl.add(gl, ">")
                                    changeGoal(gameId, res.toGoal, gl)
                                }
                                rl.play();

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
        [animates, changeGoal, changeScore, playCollect, scenes, swipeSuccess, textures]
    );


    return { solveSwap };
};
export default useSolveSwap



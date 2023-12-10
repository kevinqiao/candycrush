import { gsap } from "gsap";
import { useCallback } from "react";

import { GameScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import { ANIMATE_NAME } from "../AnimateConstants";
import { IAnimateContext } from "../AnimateManager";
import useBattleBoard from "../battle/BattleBoard";
import { playChange, playMove, playRemove } from "./ApplyMatch";
import useSwipeCandy from "./SwipeCandy";

const useSolveSwap = (props: IAnimateContext) => {
    const { animates, createAnimate } = props;
    const { scenes, textures } = useSceneManager();
    const { swipeSuccess } = useSwipeCandy(props);
    const { changeScore } = useBattleBoard(props)


    const solveSwap = useCallback(
        (gameId: string, data: any, timeline: any) => {

            const tl = gsap.timeline({
                onComplete: () => {
                    const as = animates.filter((a) => a.gameId !== gameId);
                    animates.length = 0;
                    animates.push(...as)

                }
            });
            const { candy, target, results } = data;
            swipeSuccess(gameId, candy, target, tl);
            if (results) {
                const gameScene: GameScene = scenes.get(gameId) as GameScene;
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
                                createAnimate({ id: Date.now(), name: ANIMATE_NAME.GOAL_COLLECT, data: { gameId, cells: res.toRemove, goal: res.toGoal } })
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
        [animates, createAnimate, scenes, swipeSuccess, textures]
    );


    return { solveSwap };
};
export default useSolveSwap

function changeScore(cl: gsap.core.Timeline, arg1: { gameId: string; score: { from: number; to: number; }; }) {
    throw new Error("Function not implemented.");
}

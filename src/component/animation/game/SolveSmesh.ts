import { gsap } from "gsap";
import { useCallback } from "react";
import { GameScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import { ANIMATE_NAME } from "../AnimateConstants";
import { IAnimateContext } from "../AnimateManager";
import useBattleBoard from "../battle/BattleBoard";
import { playChange, playMove, playRemove } from "./ApplyMatch";

const useSolveSmesh = (props: IAnimateContext) => {
    const { scenes, textures } = useSceneManager();
    const { animates, createAnimate } = props;
    const { changeScore } = useBattleBoard(props)
    const solveMesh = useCallback(
        (gameId: string, data: any, timeline: any) => {
            const tl = gsap.timeline({
                onComplete: () => {
                    const as = animates.filter((a) => a.gameId !== gameId);
                    animates.length = 0;
                    animates.push(...as)
                }
            });
            const { candyId, results } = data;
            console.log(results)
            if (results) {
                const gameScene: GameScene = scenes.get(gameId) as GameScene;
                for (const res of results) {
                    const ml = gsap.timeline();
                    tl.add(ml, ">");
                    if (res.toChange)
                        playChange(res.toChange, gameScene, textures, ml);
                    if (res.toRemove) {
                        playRemove(res.toRemove, gameScene, textures, ml)
                        ml.call(
                            () => {
                                createAnimate({ id: Date.now(), name: ANIMATE_NAME.GOAL_COLLECT, data: { gameId, cells: res.toRemove, goal: res.toGoal } })
                            },
                            [],
                            "<"
                        );
                    }
                    if (res.toMove) {
                        playMove(res.toMove, gameScene, textures, ml)
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
        },
        [animates, scenes, textures]
    );


    return { solveMesh };
};
export default useSolveSmesh


function changeScore(st: gsap.core.Timeline, arg1: any) {
    throw new Error("Function not implemented.");
}


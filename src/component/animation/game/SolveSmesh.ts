import { gsap } from "gsap";
import { useCallback } from "react";
import { SceneModel, useSceneManager } from "../../../service/SceneManager";
import { IAnimateContext } from "../AnimateManager";
import { playChange, playMove, playRemove } from "./ApplyMatch";

const useSolveSmesh = (props: IAnimateContext) => {
    const { scenes, textures } = useSceneManager();
    const { animates } = props;
    const solveMesh = useCallback(
        (gameId: string, data: any, timeline: any) => {
            const tl = gsap.timeline({
                onComplete: () => {
                    const as = animates.filter((a) => a.gameId !== gameId);
                    if (as.length > 0) {
                        animates.length = 0;
                        animates.push(...as)
                    }
                }
            });
            const { candyId, results } = data;

            if (results) {
                const gameScene: SceneModel = scenes.get(gameId) as SceneModel;
                for (const res of results) {
                    const ml = gsap.timeline();
                    tl.add(ml, ">");
                    if (res.toChange)
                        playChange(res.toChange, gameScene, textures, ml);
                    if (res.toRemove)
                        playRemove(res.toRemove, gameScene, textures, ml)
                    if (res.toMove)
                        playMove(res.toMove, gameScene, textures, ml)
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
import { gsap } from "gsap";
import { useCallback } from "react";

import { SceneModel, useSceneManager } from "../../../service/SceneManager";
import { IAnimateContext } from "../AnimateManager";
import { playChange, playMove, playRemove } from "./ApplyMatch";
import useSwipeCandy from "./SwipeCandy";

const useSolveSwap = (props: IAnimateContext) => {
    const { animates } = props;
    const { scenes, textures } = useSceneManager();
    const { swipeSuccess } = useSwipeCandy(props)

    const solveSwap = useCallback(
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
            const { candy, target, results } = data;
            swipeSuccess(gameId, candy, target, tl);
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
            else
                timeline.add(tl)
        },
        [animates, scenes, swipeSuccess]
    );
    // const playChange = (toChange: CellItem[], gameScene: SceneModel, tl: any) => {
    //     const candyMap = gameScene.candies;
    //     const cwidth = gameScene.cwidth;
    //     if (candyMap && cwidth) {
    //         toChange.forEach((c) => {
    //             const candy = candyMap.get(c.id);
    //             if (candy) {
    //                 tl.to(
    //                     candy,
    //                     {
    //                         onStart: () => {
    //                             const texture = textures?.find((t) => t.id === c.asset);
    //                             if (texture && candy) {
    //                                 console.log("texture:" + c.asset)
    //                                 candy.texture = texture.texture;
    //                             }
    //                         },
    //                         x: c.column * cwidth + Math.floor(cwidth / 2),
    //                         y: c.row * cwidth + Math.floor(cwidth / 2),
    //                         duration: 0.3,
    //                         ease: 'power2.out',
    //                     }, "<")
    //             }
    //         })
    //     }
    // }
    // const playMove = (toMove: CellItem[], gameScene: SceneModel, tl: any) => {
    //     const candyMap = gameScene.candies;
    //     const cwidth = gameScene.cwidth;
    //     if (candyMap && cwidth)
    //         toMove.forEach((c) => {
    //             const candy = candyMap.get(c.id);
    //             if (candy) {
    //                 tl.to(
    //                     candy,
    //                     {
    //                         x: c.column * cwidth + Math.floor(cwidth / 2),
    //                         y: c.row * cwidth + Math.floor(cwidth / 2),
    //                         duration: 0.4,
    //                         ease: 'power2.out',
    //                     }, "<")
    //             }
    //         })
    // }

    // const playRemove = (toRemove: CellItem[], gameScene: SceneModel, tl: any) => {
    //     const candyMap = gameScene.candies;
    //     if (candyMap)
    //         toRemove.forEach((c) => {
    //             const candy = candyMap.get(c.id);
    //             if (candy) {
    //                 candyMap.delete(c.id);
    //                 tl.to(
    //                     candy,
    //                     {
    //                         alpha: 0,
    //                         duration: 0.3,
    //                         ease: 'power2.out',
    //                         onComplete: function () {
    //                             candy.destroy()
    //                         },

    //                     }, "<");
    //             }
    //         })
    //     // tl.call(
    //     //     () => {
    //     //         const cl = gsap.timeline();
    //     //         playCollect(gameId, toRemove, cl);
    //     //         cl.play();
    //     //     },
    //     //     [],
    //     //     ">-0.1"
    //     // );

    // }

    return { solveSwap };
};
export default useSolveSwap
import { gsap } from "gsap";
import { useCallback } from "react";

import { CellItem } from "../../../model/CellItem";
import { GameScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import { ANIMATE_NAME } from "../AnimateConstants";
import { IAnimateContext } from "../AnimateManager";


const useSwipeCandy = (props: IAnimateContext) => {
    const { animates } = props;
    const { scenes } = useSceneManager();
    const swipeSuccess = useCallback(
        // (animate: Animate, timeline: any) => {
        (gameId: string, candy: CellItem, target: CellItem, timeline: any) => {
            // const { gameId, candy, target } = animate.data
            const gameScene = scenes.get(gameId) as GameScene;
            if (!gameScene) return;
            const tl = gsap.timeline({
                // onComplete: () => {
                //     const index = animates.findIndex((a) => a.name === animate.name);
                //     if (index >= 0)
                //         animates.splice(index, 1)
                // }
            });
            console.log(candy)
            console.log(gameScene.candies.size)
            const candySprite = gameScene.candies?.get(candy.id);
            const targetSprite = gameScene.candies?.get(target.id);
            if (gameScene.cwidth && candySprite && targetSprite) {
                candySprite.column = candy.column;
                candySprite.row = candy.row;
                targetSprite.column = target.column;
                targetSprite.row = target.row;
                const cwidth = gameScene.cwidth;
                const cx = candy.column * cwidth + Math.floor(cwidth / 2);
                const cy = candy.row * cwidth + Math.floor(cwidth / 2);
                const tx = target.column * cwidth + Math.floor(cwidth / 2);
                const ty = target.row * cwidth + Math.floor(cwidth / 2);
                tl.to(
                    candySprite,
                    {
                        x: cx,
                        y: cy,
                        duration: 0.3,
                        ease: 'power2.out',
                    }).to(
                        targetSprite,
                        {
                            x: tx,
                            y: ty,
                            duration: 0.3,
                            ease: 'power2.out',
                        }, "<");

            }
            if (!timeline)
                tl.play();
            else
                timeline.add(tl)
        },
        [animates]
    );
    const swipeFail = useCallback(
        (gameId: string, candyId: number, targetId: number, timeline: any) => {
            console.log("swipe fail")
            const gameScene = scenes.get(gameId) as GameScene;
            if (!gameScene) return;
            const tl = gsap.timeline({
                onComplete: () => {
                    const index = animates.findIndex((a) => a.name === ANIMATE_NAME.SWIPE_FAIL);
                    if (index >= 0)
                        animates.splice(index, 1)
                }
            });

            const candySprite = gameScene.candies?.get(candyId);
            const targetSprite = gameScene.candies?.get(targetId);
            if (gameScene.cwidth && candySprite && targetSprite) {
                const cwidth = gameScene.cwidth;
                const cx = candySprite.x;
                const cy = candySprite.y;
                const tx = targetSprite.x;
                const ty = targetSprite.y;
                tl.to(
                    targetSprite,
                    {
                        x: cx,
                        y: cy,
                        duration: 0.4,
                        ease: 'power2.out',
                    }).to(
                        candySprite,
                        {
                            x: tx,
                            y: ty,
                            duration: 0.4,
                            ease: 'power2.out',
                        }, "<")
                tl.to(
                    targetSprite,
                    {
                        x: tx,
                        y: ty,
                        duration: 0.4,
                        ease: 'power2.out',
                    }, ">").to(
                        candySprite,
                        {
                            x: cx,
                            y: cy,
                            duration: 0.4,
                            ease: 'power2.out',
                        }, "<")
            }
            if (!timeline)
                tl.play();
            else
                timeline.add(tl)
        },
        [animates]
    );

    return { swipeSuccess, swipeFail };
};
export default useSwipeCandy
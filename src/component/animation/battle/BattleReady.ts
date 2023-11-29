import { gsap } from "gsap";
import { useCallback } from "react";
import { SceneModel } from "../../../service/SceneManager";
import { CandySprite } from "../../pixi/CandySprite";
import { ANIMATE_NAME } from "../AnimateConstants";
import { IAnimateContext } from "../AnimateManager";


const useBattleReady = (props: IAnimateContext) => {
    const { animates } = props;
    const startReady = useCallback(
        (timeline: any) => {
            const animate = animates.find((a) => a.name === ANIMATE_NAME.GAME_INITED);
            if (!animate) return;
            const sceneEle = animate.eles?.find((e) => e.name === "gamescene");
            if (sceneEle?.ele) {
                const gameScene = sceneEle.ele as SceneModel;
                const tl = timeline ?? gsap.timeline();
                if (gameScene && gameScene.candies && gameScene.column && gameScene.row) {
                    const candies: CandySprite[] = Array.from(gameScene.candies.values());
                    for (let row = 0; row < gameScene.row; row++) {
                        const rowTL = gsap.timeline();
                        tl.add(rowTL, "<");
                        const len = Math.floor(gameScene.column / 2);
                        for (let column = 0; column < len; column++) {
                            const candy1 = candies.find((c) => c.row === row && c.column === column);
                            const col = gameScene.column - column - 1;
                            const candy2 = candies.find((c) => c.row === row && c.column === col);

                            if (candy1 && candy2) {
                                rowTL.from(candy1.scale, { x: 0, y: 0, duration: 0.8, ease: "power4.out" }, "<+=0.1");
                                rowTL.to(candy1, { alpha: 1, duration: 0.8, ease: "power4.out" }, "<");
                                rowTL.from(candy2.scale, { x: 0, y: 0, duration: 0.8, ease: "power4.out" }, "<");
                                rowTL.to(candy2, { alpha: 1, duration: 0.8, ease: "power4.out" }, "<");
                            }

                        }
                        if (1 === gameScene.column % 2) {
                            const center = candies.find((c) => c.row === row && c.column === len);
                            if (center?.id) {
                                const candy = candies.find((c) => c.id === center.id);
                                if (candy) {
                                    rowTL.from(candy.scale, { x: 0, y: 0, duration: 0.8, ease: "power4.out" }, "<+=0.1");
                                    rowTL.to(candy, { alpha: 1, duration: 0.8, ease: "power4.out" }, "<");
                                }
                            }
                        }
                    }
                }
                if (!timeline)
                    tl.play();
            }
        },
        [animates]
    );

    return { startReady };
};
export default useBattleReady
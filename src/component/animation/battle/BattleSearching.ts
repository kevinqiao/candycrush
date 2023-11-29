import { gsap } from "gsap";
import { useCallback } from "react";

import { ANIMATE_NAME } from "../AnimateConstants";
import { IAnimateContext } from "../AnimateManager";


const useBattleSearching = (props: IAnimateContext) => {
    const { animates } = props;
    const startSearching = useCallback(
        (timeline: any) => {

            const animate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_SEARCH);
            if (!animate) return;
            const tl = timeline ?? gsap.timeline({ repeat: -1, yoyo: true });
            const searchEle = animate.eles?.find((e) => e.name === "search");
            if (searchEle) {
                tl.fromTo(
                    searchEle.ele,
                    { scaleX: 0.9, scaleY: 0.9 },
                    { duration: 0.8, scaleX: 1.1, scaleY: 1.1, ease: "power2.inOut" }
                );
            }
            if (!timeline)
                tl.play();
        },
        [animates]
    );
    const closeSearching = useCallback(
        (timeline: any) => {
            console.log("animate size:" + animates.length)
            console.log(animates.map((a) => a.name))
            const animate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_SEARCH);
            if (!animate) {
                console.log("animate for search is null")
                return;
            }
            const tl = timeline ?? gsap.timeline();
            const searchDiv = animate.eles?.find((e) => e.name === "search");
            if (searchDiv) {
                tl.to(searchDiv.ele, { alpha: 0, duration: 0.1 }, "<");
            }
            if (!timeline)
                tl.play();
        },
        [animates]
    );

    return { startSearching, closeSearching };
};
export default useBattleSearching
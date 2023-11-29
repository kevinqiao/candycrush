import { gsap } from "gsap";
import { useEffect } from "react";
import { ANIMATE_NAME } from "./AnimateConstants";
import { IAnimateContext } from "./AnimateManager";
import useBattleMatching from "./battle/BattleMatching";
import useBattleReady from "./battle/BattleReady";
import useBattleSearching from "./battle/BattleSearching";


export const useBattleAnimateHandler = (props: IAnimateContext) => {
    const { animates, animateEvent, updateAnimate } = props;
    const { startSearching, closeSearching } = useBattleSearching(props);
    const { startBattleMatching, closeBattleMatching } = useBattleMatching(props)
    const { startReady } = useBattleReady(props)
    console.log("animate size:" + animates.length)
    console.log(animateEvent)
    useEffect(() => {
        console.log(animateEvent?.name)
        if (animateEvent?.name) {
            switch (animateEvent.name) {
                case ANIMATE_NAME.BATTLE_SEARCH:
                    if (!animateEvent.type) {
                        startSearching(null);
                        updateAnimate(ANIMATE_NAME.BATTLE_SEARCH, { status: 1 })
                    }
                    break;
                case ANIMATE_NAME.BATTLE_MATCHED:
                    if (!animateEvent.type) {
                        closeSearching(null);
                        startBattleMatching(null)
                    } else if (animateEvent.data.status) {
                        const animate = animates.find((a) => a.name === ANIMATE_NAME.GAME_INITED);
                        if (animate) {
                            const master = gsap.timeline()
                            const mtl = gsap.timeline()
                            const rtl = gsap.timeline()
                            master.add(mtl, ">+=1.2").add(rtl, ">+=0.3");
                            closeBattleMatching(mtl)
                            startReady(rtl)
                        }
                    }
                    break;
                case ANIMATE_NAME.GAME_INITED:
                    const timeline = gsap.timeline()
                    const animate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_MATCHED);
                    if (animate?.status) {
                        closeBattleMatching(timeline);
                    }
                    startReady(timeline);
                    timeline.play();
                    break;
                default:
                    break;
            }
        }
    }, [animateEvent, startSearching])


}
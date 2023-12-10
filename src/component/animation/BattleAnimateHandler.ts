import { gsap } from "gsap";
import { useEffect } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { useSceneManager } from "../../service/SceneManager";
import { ANIMATE_NAME } from "./AnimateConstants";
import { IAnimateContext } from "./AnimateManager";
import useBattleMatching from "./battle/BattleMatching";
import useBattleSearching from "./battle/BattleSearching";


export const useBattleAnimateHandler = (props: IAnimateContext) => {
    const { animates, animateEvent, removeAnimate } = props;
    const { startSearching, closeSearching } = useBattleSearching(props);
    const { startBattleMatching } = useBattleMatching(props)
    const { scenes, sceneEvent } = useSceneManager();
    useEffect(() => {
        const animate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_SEARCH);
        if (animate && !animate.status) {
            const scene = scenes.get(SCENE_NAME.BATTLE_MATCHING);
            if (scene) {
                animate.status = 1;
                const timeline = gsap.timeline({
                    onComplete: () => {
                        removeAnimate(animate.id)
                    }
                })
                startSearching(timeline);
                timeline.play();
            }
        }
    }, [animateEvent, animates, sceneEvent, scenes])

    useEffect(() => {
        const animate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_MATCHED);
        if (animate && !animate.status) {
            const scene = scenes.get(SCENE_NAME.BATTLE_MATCHING);
            if (scene) {
                animate.status = 1;
                console.log("lanuch animate opponent matched")
                startBattleMatching(null)
            }
        }

    }, [animateEvent, animates, sceneEvent, scenes])
    // useEffect(() => {
    //     if (animateEvent?.name) {
    //         switch (animateEvent.name) {
    //             case ANIMATE_NAME.BATTLE_SEARCH:
    //                 if (!animateEvent.type) {
    //                     startSearching(null);
    //                     updateAnimate(ANIMATE_NAME.BATTLE_SEARCH, { status: 1 })
    //                 }
    //                 break;
    //             case ANIMATE_NAME.BATTLE_MATCHED:
    //                 if (!animateEvent.type) {
    //                     closeSearching(null);
    //                     startBattleMatching(null)
    //                 }
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }
    // }, [animateEvent, closeSearching, startBattleMatching, startSearching, updateAnimate])


}
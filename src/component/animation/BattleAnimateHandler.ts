import { gsap } from "gsap";
import { useCallback, useEffect } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { useSceneManager } from "../../service/SceneManager";
import { ANIMATE_EVENT_TYPE, ANIMATE_NAME } from "./AnimateConstants";
import { IAnimateHandleContext } from "./AnimateManager";
import useBattleMatching from "./battle/BattleMatching";
import useBattleSearching from "./battle/BattleSearching";

export const useBattleAnimateHandler = (props: IAnimateHandleContext) => {
    const { animates, animateEvent, removeAnimate } = props;
    const { startSearching } = useBattleSearching(props);
    const { startBattleMatching } = useBattleMatching(props)
    const { scenes } = useSceneManager();
    const processSearch = useCallback(() => {
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
    }, [])

    const processMatch = useCallback(() => {
        const animate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_MATCHED);
        if (animate && !animate.status) {
            const scene = scenes.get(SCENE_NAME.BATTLE_MATCHING);
            if (scene) {
                animate.status = 1;
                console.log("lanuch animate opponent matched")
                startBattleMatching(null)
            }
        }

    }, [])

    useEffect(() => {
        if (animateEvent?.name) {
            console.log(animateEvent)
            if (!scenes.get(SCENE_NAME.BATTLE_MATCHING)) return;
            if (animateEvent.type === ANIMATE_EVENT_TYPE.CREATE) {
                switch (animateEvent.name) {
                    case ANIMATE_NAME.BATTLE_SEARCH:
                        processSearch();
                        break;
                    case ANIMATE_NAME.BATTLE_MATCHED:
                        processMatch()
                        break;
                    default:
                        break;
                }
            }
        }
    }, [animateEvent, animates, processMatch, processSearch, scenes])

}
import { gsap } from "gsap";
import { useCallback } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { SearchScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import { ANIMATE_NAME } from "../AnimateConstants";
import { IAnimateContext } from "../AnimateManager";

const useBattleMatching = (props: IAnimateContext) => {
    const { scenes } = useSceneManager();
    const { animates, updateAnimate } = props;

    const startBattleMatching = useCallback((timeline: any) => {
        const scene = scenes.get(SCENE_NAME.BATTLE_MATCHING) as SearchScene;
        const animate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_MATCHED);
        if (!scene || !animate) return;
        let tl = timeline ?? gsap.timeline({
            ease: "power2.inOut", onComplete: () => {
                // updateAnimate(ANIMATE_NAME.BATTLE_MATCHED, { status: 2 })
            }
        })
        tl.to(scene.searchTxTEle, { alpha: 0, duration: 0.1 });
        tl.to(scene.foundTxTEle, { alpha: 1, duration: 0.1 }, "<");
        tl.fromTo(scene.vsEle, { scaleX: 0, scaleY: 0 }, { scaleX: 1.4, scaleY: 1.4, duration: 0.6 }, ">")
        tl.to(scene.vsEle, { alpha: 1, duration: 0.8 }, "<");
        tl.to(scene.playerAvatarEle, { duration: 1.2, alpha: 1, x: scene.width * 0.35 }, "<")
        tl.to(scene.opponentAvatarEle, { duration: 1.2, alpha: 1, x: -scene.width * 0.35 }, "<");
        tl.call(
            () => {
                updateAnimate(animate.id, { status: 2 })
            },
            [],
            ">+=1"
        );
        if (!timeline)
            tl.play();
    }, []);

    const closeBattleMatching = useCallback(
        (timeline: any) => {

            const scene = scenes.get(SCENE_NAME.BATTLE_MATCHING) as SearchScene;
            if (!scene) {
                console.log("related scene not created")
                return;
            }
            const tl = timeline ?? gsap.timeline();

            tl.to(scene.searchTxTEle, { alpha: 0, duration: 1.2 }, "<");
            tl.to(scene.playerAvatarEle, { duration: 1.2, x: 0, alpha: 0 }, "<")
                .to(scene.opponentAvatarEle, { duration: 1.2, x: 0, alpha: 0 }, "<");
            tl.to(scene.app, { duration: 1.2, alpha: 0 }, "<")
            if (!timeline)
                tl.play();

        }, [animates, scenes])
    return { startBattleMatching, closeBattleMatching };
};
export default useBattleMatching
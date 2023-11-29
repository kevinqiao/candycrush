import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import { useCallback } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { useSceneManager } from "../../../service/SceneManager";
import { Avatar } from "../../pixi/Avatar";
import { ANIMATE_NAME } from "../AnimateConstants";
import { AnimateElement, IAnimateContext } from "../AnimateManager";

const useBattleMatching = (props: IAnimateContext) => {
    const { scenes, avatarTextures } = useSceneManager();
    const { animates, updateAnimate } = props;

    const startBattleMatching = useCallback((timeline: any) => {
        const eles: AnimateElement[] = [];
        let tl = timeline ?? gsap.timeline({
            ease: "power2.inOut", onComplete: () => {
                const animate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_MATCHED);
                if (animate) {
                    updateAnimate(ANIMATE_NAME.BATTLE_MATCHED, { status: 1, eles })
                }
            }
        });
        const searchAnimate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_SEARCH)
        const searchEle = searchAnimate?.eles?.find((e) => e.name === "search");
        if (searchEle) {
            console.log("hide search");
            tl.to(searchEle.ele, { alpha: 0, duration: 0.1 });
        }
        const foundEle = searchAnimate?.eles?.find((e) => e.name === "found");
        if (foundEle) {
            console.log("show found");
            tl.to(foundEle.ele, { alpha: 1, duration: 0.1 }, "<");
        }
        const versusEle = searchAnimate?.eles?.find((e) => e.name === "versus");
        if (versusEle) {
            tl.fromTo(versusEle.ele, { scaleX: 0, scaleY: 0 }, { scaleX: 1.4, scaleY: 1.4, duration: 0.6 }, ">")
            tl.to(versusEle.ele, { alpha: 1, duration: 0.6 }, "<");
        }
        const scene = scenes.get(SCENE_NAME.BATTLE_HOME);
        const a1texture = avatarTextures.find((a) => a.name === "A1");
        const a2texture = avatarTextures.find((a) => a.name === "A2");
        if (scene && a1texture && a2texture) {
            const w = scene.width;
            const h = scene.height;
            const avatar1 = new Avatar(a1texture.texture, "Kevin Qiao", 100, 140);
            const avatar2 = new Avatar(a2texture.texture, "Chris Li", 100, 140);
            avatar1.x = w / 2 - 150;
            avatar1.y = h / 2;
            avatar2.x = w / 2 + (150 - 80);
            avatar2.y = h / 2;
            const app = scene.app as PIXI.Application;
            app.stage.addChild(avatar1);
            app.stage.addChild(avatar2);
            tl.from(avatar1, { duration: 0.6, x: -100, y: h / 2 }, "<")
            tl.from(avatar2, { duration: 0.6, x: w + 100, y: h / 2 }, "<")
            eles.push({ name: "A1", type: 2, ele: avatar1 })
            eles.push({ name: "A2", type: 2, ele: avatar2 })
        }
        if (!timeline)
            tl.play();
    }, [scenes, avatarTextures]);

    const closeBattleMatching = useCallback(
        (timeline: any) => {
            const searchAnimate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_SEARCH);
            const matchAnimate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_MATCHED);
            if (!searchAnimate || !matchAnimate) return;
            const tl = timeline ?? gsap.timeline();
            const searchEle = searchAnimate.eles?.find((e) => e.name === "scene");
            if (searchEle) {
                tl.to(searchEle.ele, { alpha: 0, duration: 1 }, "<");
            }
            const scene = scenes.get(SCENE_NAME.BATTLE_HOME);
            const avatar1 = matchAnimate.eles?.find((e) => e.name === "A1");
            const avatar2 = matchAnimate.eles?.find((e) => e.name === "A2");
            if (scene && avatar1 && avatar2) {
                tl.to(avatar1.ele, { duration: 1, x: -100 }, "<")
                    .to(avatar2.ele, { duration: 1, x: scene.width + 100 }, "<")
            }
            if (!timeline)
                tl.play();
        },
        [animates]
    );
    return { startBattleMatching, closeBattleMatching };
};
export default useBattleMatching
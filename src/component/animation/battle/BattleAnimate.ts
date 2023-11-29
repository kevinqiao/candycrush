import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import { SCENE_NAME } from "../../../model/Constants";
import { useBattleManager } from "../../../service/BattleManager";
import { useSceneManager } from "../../../service/SceneManager";
import { Avatar } from "../../pixi/Avatar";

const useBattleAnimate = () => {
    const { scenes, avatarTextures } = useSceneManager();
    const { battle } = useBattleManager();
    const playBattleMatching = (eles: { name: string; ele: HTMLDivElement }[]) => {
        if (battle) {
            const searchEle = eles.find((e) => e.name === "search");
            const foundEle = eles.find((e) => e.name === "found");
            const vsEle = eles.find((e) => e.name === "vs")
            if (!searchEle || !foundEle || !vsEle) return;
            const tl = gsap.timeline({
                onComplete: () => {
                    console.log("match opponent animation completed")
                }
            });
            tl.to(searchEle, { duration: 1 })


            const scene = scenes.get(SCENE_NAME.BATTLE_HOME);
            const a1texture = avatarTextures.find((a) => a.name === "A1");
            const a2texture = avatarTextures.find((a) => a.name === "A2");
            if (scene && a1texture && a2texture) {
                const w = scene.width;
                const h = scene.height;
                const avatar1 = new Avatar(a1texture.texture, "Kevin Qiao", 100, 140);
                const avatar2 = new Avatar(a2texture.texture, "Chris Li", 100, 140);
                avatar1.x = w / 2 - 100;
                avatar1.y = h / 2;
                avatar2.x = w / 2 + (100 - 80);
                avatar2.y = h / 2;
                const app = scene.app as PIXI.Application
                app.stage.addChild(avatar1)
                app.stage.addChild(avatar2);
                tl.from(avatar1, { duration: 1, x: -100, y: h / 2 }).from(avatar2, { duration: 1, x: w + 100, y: h / 2 }, "<").to([avatar1, avatar2], { duration: 0.1, alpha: 0 }, ">+=1")
                tl.play();
            }
        }

    }
    const playBattleLoading = (eles: { name: string; ele: HTMLDivElement }[]) => {

    }
    return { playBattleMatching }
}
export default useBattleAnimate
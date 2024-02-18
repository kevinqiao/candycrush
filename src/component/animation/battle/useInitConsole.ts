import { gsap } from "gsap";
import { useCallback } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { ConsoleScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";

const useInitConsole = () => {
    const { scenes } = useSceneManager();
    const play = useCallback(
        (isPlayer: boolean, gameId: string, score: number, timeline: any) => {
            const scene: ConsoleScene | undefined = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
            if (!scene?.goalPanels) return;
            const tl = timeline ?? gsap.timeline();
            tl.to(scene.app, {
                alpha: 1,
                duration: 1.0,
            })
            const sl = gsap.timeline();
            tl.add(sl, "<");

            const avatarbar = scene.avatarBars.find((b) => b.gameId === gameId);
            if (avatarbar?.bar) {
                const width = avatarbar.bar.offsetWidth
                sl.from(avatarbar.bar, {
                    width: 0, alpha: 0, x: isPlayer ? 0 : width, duration: 1.0, onUpdate: () => {
                        const progress = sl.progress();
                        const animatedValue = progress * score;
                        if (avatarbar.score)
                            avatarbar.score.innerHTML = Math.floor(animatedValue) + "";
                    }
                }, "<");
            }

            const gl = gsap.timeline();
            tl.add(gl, "<")
            const panel = scene.goalPanels.find((p) => p.gameId === gameId)
            if (panel)
                for (const goal of panel.goals) {
                    gl.from(goal.iconEle, { alpha: 0, duration: 0.8 }, ">-=0.4");
                }
            if (!timeline)
                tl.play();
        },
        [scenes]
    );


    return { play };
};
export default useInitConsole
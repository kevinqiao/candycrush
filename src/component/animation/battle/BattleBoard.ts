import { gsap } from "gsap";
import { useCallback } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { ConsoleScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import { IAnimateContext } from "../AnimateManager";


const useBattleBoard = (props: IAnimateContext) => {
    const { scenes } = useSceneManager();

    const initBoard = useCallback(
        (timeline: any, data: { gameId: string, score: number }) => {

            const scene: ConsoleScene | undefined = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
            if (!scene) return;
            const tl = timeline ?? gsap.timeline();
            tl.to(scene.app, {
                alpha: 1,
                duration: 1.0,
            })
            const sl = gsap.timeline();
            tl.add(sl, "<");
            const avatarbar = scene.avatarBars[0];
            sl.from(avatarbar.bar, {
                width: 0, duration: 1.0, onUpdate: () => {
                    const progress = sl.progress();
                    const animatedValue = progress * data.score;
                    if (avatarbar.score)
                        avatarbar.score.innerHTML = Math.floor(animatedValue) + "";
                }
            }, "<");

            const gl = gsap.timeline();
            tl.add(gl, "<")
            for (let goal of scene.goalPanels[0].goals) {
                gl.from(goal.iconEle, { alpha: 0, duration: 0.8 }, ">-=0.4");
            }
            if (!timeline)
                tl.play();
        },
        [scenes]
    );

    const changeScore = useCallback(
        (timeline: any, score: { gameId: string, from: number, to: number }) => {

            const scene: ConsoleScene | undefined = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
            if (!scene || !score) return;
            const tl = timeline ?? gsap.timeline();
            const avatarbar = scene.avatarBars[0];
            const sl = gsap.timeline();
            tl.add(sl, "<");
            sl.from(avatarbar.bar, {
                duration: 0.7, onUpdate: () => {
                    const progress = sl.progress();
                    const animatedValue = progress * (score.to - score.from) + score.from;
                    if (avatarbar.score)
                        avatarbar.score.innerHTML = Math.floor(animatedValue) + "";
                }
            }, "<");
            if (!timeline)
                tl.play();
        },
        [scenes]
    );
    const changeGoal = useCallback(
        (gameId: string, goal: { asset: number; start: number; end: number }[], timeline: any) => {
            const consoleScene = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
            if (consoleScene) {
                const tl = timeline ?? gsap.timeline();
                const panel = consoleScene.goalPanels.find((p) => p.gameId === gameId);
                for (const item of goal) {
                    const et = gsap.timeline();
                    tl.add(et, "<")
                    const m = panel?.goals.find((g) => g.asset === item.asset);
                    if (m?.qtyEle) {
                        et.to(m.qtyEle, {
                            duration: 0.7, onUpdate: () => {
                                const progress = et.progress();
                                const animatedValue = item.start - progress * (item.start - item.end);
                                if (m.qtyEle)
                                    m.qtyEle.innerHTML = Math.floor(animatedValue) + "";
                            }
                        }, "<");

                    }
                }
                if (!timeline)
                    tl.play();
            }

        },
        [scenes]
    );

    return { initBoard, changeGoal, changeScore };
};
export default useBattleBoard
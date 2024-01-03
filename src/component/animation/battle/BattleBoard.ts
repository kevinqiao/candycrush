import { gsap } from "gsap";
import { useCallback } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { ConsoleScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import { useUserManager } from "../../../service/UserManager";
import { IAnimateContext } from "../AnimateManager";


const useBattleBoard = () => {
    const { scenes } = useSceneManager();
    const { user } = useUserManager();

    const initConsole = useCallback(
        ( uid: string, gameId: string, score: number,timeline:any) => {
            const scene: ConsoleScene | undefined = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
            if (!scene) return;
            const tl = timeline ?? gsap.timeline();
            tl.to(scene.app, {
                alpha: 1,
                duration: 1.0,
            })
            const sl = gsap.timeline();
            tl.add(sl, "<");

            const avatarbar = scene.avatarBars.find((b) => b.gameId === gameId);
            if (avatarbar?.bar) {

                const { width } = avatarbar.bar.getBoundingClientRect();
                sl.from(avatarbar.bar, {
                    width: 0, alpha: 0, x: user.uid === uid ? 0 : width, duration: 1.0, onUpdate: () => {
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
                for (let goal of panel.goals) {
                    gl.from(goal.iconEle, { alpha: 0, duration: 0.8 }, ">-=0.4");
                }
            if (!timeline)
                tl.play();
        },
        [scenes]
    );
    const initBoard = useCallback(
        (timeline: any, data: { uid: string, gameId: string, score: number }) => {

            const scene: ConsoleScene | undefined = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
            if (!scene) return;
            const tl = timeline ?? gsap.timeline();
            tl.to(scene.app, {
                alpha: 1,
                duration: 1.0,
            })
            const sl = gsap.timeline();
            tl.add(sl, "<");

            const avatarbar = scene.avatarBars.find((b) => b.gameId === data.gameId);
            if (avatarbar?.bar) {

                const { width } = avatarbar.bar.getBoundingClientRect();
                sl.from(avatarbar.bar, {
                    width: 0, alpha: 0, x: user.uid === data.uid ? 0 : width, duration: 1.0, onUpdate: () => {
                        const progress = sl.progress();
                        const animatedValue = progress * data.score;
                        if (avatarbar.score)
                            avatarbar.score.innerHTML = Math.floor(animatedValue) + "";
                    }
                }, "<");
            }

            const gl = gsap.timeline();
            tl.add(gl, "<")
            const panel = scene.goalPanels.find((p) => p.gameId === data.gameId)
            if (panel)
                for (let goal of panel.goals) {
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
            const avatarbar = scene.avatarBars.find((a) => a.gameId === score.gameId);
            if (!avatarbar) return
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
                    if (item.start <= 0) continue;
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

    return { initConsole,initBoard, changeGoal, changeScore };
};
export default useBattleBoard
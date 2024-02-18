import { gsap } from "gsap";
import { useCallback } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { ConsoleScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import { useUserManager } from "../../../service/UserManager";



const useBattleBoard = () => {
    const { scenes } = useSceneManager();
    const { user } = useUserManager();

    const initConsole = useCallback(
        (uid: string, gameId: string, score: number, timeline: any) => {
            const scene: ConsoleScene | undefined = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
            if (!scene?.goalPanels || !user) return;
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
                for (const goal of panel.goals) {
                    gl.from(goal.iconEle, { alpha: 0, duration: 0.8 }, ">-=0.4");
                }
            if (!timeline)
                tl.play();
        },
        [scenes, user]
    );
    // const initBoard = useCallback(
    //     (timeline: any, data: { uid: string, gameId: string, score: number }) => {

    //         const scene: ConsoleScene | undefined = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
    //         if (!scene) return;
    //         const tl = timeline ?? gsap.timeline();
    //         tl.to(scene.app, {
    //             alpha: 1,
    //             duration: 1.0,
    //         })
    //         const sl = gsap.timeline();
    //         tl.add(sl, "<");

    //         const avatarbar = scene.avatarBars.find((b) => b.gameId === data.gameId);
    //         if (avatarbar?.bar) {

    //             const { width } = avatarbar.bar.getBoundingClientRect();
    //             sl.from(avatarbar.bar, {
    //                 width: 0, alpha: 0, x: user.uid === data.uid ? 0 : width, duration: 1.0, onUpdate: () => {
    //                     const progress = sl.progress();
    //                     const animatedValue = progress * data.score;
    //                     if (avatarbar.score)
    //                         avatarbar.score.innerHTML = Math.floor(animatedValue) + "";
    //                 }
    //             }, "<");
    //         }

    //         const gl = gsap.timeline();
    //         tl.add(gl, "<")
    //         const panel = scene.goalPanels.find((p) => p.gameId === data.gameId)
    //         if (panel)
    //             for (const goal of panel.goals) {
    //                 gl.from(goal.iconEle, { alpha: 0, duration: 0.8 }, ">-=0.4");
    //             }
    //         if (!timeline)
    //             tl.play();
    //     },
    //     [scenes]
    // );

    const changeScore = useCallback(
        (gameId: string, score: { from: number, to: number }, timeline: any) => {

            const scene: ConsoleScene | undefined = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
            if (!scene || !score) return;
            const tl = timeline ?? gsap.timeline();
            const avatarbar = scene.avatarBars.find((a) => a.gameId === gameId);
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

            if (avatarbar.plus) {
                const span = document.createElement('span');
                avatarbar.plus.appendChild(span)
                const pl = gsap.timeline({
                    onComplete: () => {
                        if (avatarbar.plus) {
                            console.log("remove span")
                            avatarbar.plus?.removeChild(span)
                        }
                    }
                });
                tl.add(pl, "<");
                span.innerHTML = "+" + (score.to - score.from)
                pl.to(span, { autoAlpha: 1, duration: 0 }, "<");
                pl.to(span, { y: -20, duration: 0.3 }, ">");
                pl.to(span, { autoAlpha: 0, y: -60, duration: 0.8 }, ">");
                pl.to(span, { y: 0, duration: 0 }, ">");
            }
            if (!timeline)
                tl.play();
        },
        [scenes]
    );
    const changeGoal = useCallback(
        (gameId: string, goals: { asset: number; from: number; to: number }[], timeline: any) => {
            const consoleScene = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
            if (consoleScene) {
                const tl = timeline ?? gsap.timeline();
                const panel = consoleScene.goalPanels.find((p) => p.gameId === gameId);
                for (const item of goals) {
                    // if (item.from <= 0) continue;
                    const et = gsap.timeline();
                    tl.add(et, "<")
                    const m = panel?.goals.find((g) => g.asset === item.asset);
                    if (m?.qtyEle) {
                        et.to(m.qtyEle, {
                            duration: 0.7, onUpdate: () => {
                                const progress = et.progress();
                                const animatedValue = item.from - progress * (item.from - item.to);
                                if (m.qtyEle)
                                    m.qtyEle.innerHTML = animatedValue <= 0 ? "✔️" : Math.floor(animatedValue) + "";
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

    return { initConsole, changeGoal, changeScore };
};
export default useBattleBoard
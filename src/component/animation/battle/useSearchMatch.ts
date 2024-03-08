import { gsap } from "gsap";
import { SCENE_NAME } from "model/Constants";
import { SearchScene } from "model/SceneModel";
import { useCallback } from "react";
import { useSceneManager } from "service/SceneManager";


export const useSearchMatch = () => {
    const { scenes } = useSceneManager();
    const playCloseMatching = useCallback((eles: Map<string, HTMLDivElement>, timeline: any) => {
        const containerEle = eles.get("container");
        const foundEle = eles.get("found");
        const vsEle = eles.get("vs");
        const playerAvatarEle = eles.get("playerAvatar");
        const opponentAvatarEle = eles.get("opponentAvatar");
        const startEle = eles.get("start");
        if (!containerEle || !foundEle || !vsEle || !playerAvatarEle || !opponentAvatarEle || !startEle) return;
        const tl = timeline ?? gsap.timeline({
            onComplete: () => {
                tl.kill();
            },
        });
        tl.to(containerEle, { autoAlpha: 0, duration: 0.5 });
        if (!timeline)
            tl.play();

    }, []);

    const playMatching = useCallback((eles: Map<string, HTMLDivElement>, timeline: any) => {
        const containerEle = eles.get("container");
        const foundEle = eles.get("found");
        const vsEle = eles.get("vs");
        const playerAvatarEle = eles.get("playerAvatar");
        const opponentAvatarEle = eles.get("opponentAvatar");
        const startEle = eles.get("start");

        if (!containerEle || !foundEle || !vsEle || !playerAvatarEle || !opponentAvatarEle || !startEle) {
            console.log("match scene element is null")
            return;
        }
        const width = containerEle.offsetWidth;
        // const height = containerEle.offsetHeight;
        const ml = timeline ?? gsap.timeline({
            onComplete: () => {
                ml.kill();
            },
        });
        const tl = gsap.timeline({
            onComplete: () => {
                tl.kill();
            },
        });
        //close search, open success match
        ml.add(tl);
        tl.to(containerEle, { autoAlpha: 1, duration: 0 })
        tl.to(foundEle, { autoAlpha: 1, duration: 0.1 }, "<");
        tl.fromTo(vsEle, { scaleX: 0, scaleY: 0 }, { scaleX: 1.4, scaleY: 1.4, duration: 0.6 }, ">");
        tl.to(vsEle, { autoAlpha: 1, duration: 0.8 }, "<");
        tl.to(playerAvatarEle, { duration: 1.2, autoAlpha: 1, x: width * 0.35 }, "<");
        tl.to(opponentAvatarEle, { duration: 1.2, autoAlpha: 1, x: -width * 0.35 }, "<");
        // const sl = gsap.timeline();
        // ml.add(sl, ">");
        // sl.to(
        //     startEle,
        //     {
        //         duration: 0.3,
        //         autoAlpha: 1,
        //     },
        //     ">"
        // );
        // sl.to(startEle, { duration: 0.9, autoAlpha: 0 }, ">");
        if (!timeline)
            ml.play();
    }, []);


    const playSearch = useCallback((timeline: any) => {
        const searchScene = scenes.get(SCENE_NAME.BATTLE_SEARCH) as SearchScene;

        if (!searchScene.containerEle || !searchScene.searchEle) return;
        const tl = timeline ?? gsap.timeline({
            onComplete: () => {
                tl.kill();
            }
        });
        // const sl = gsap.timeline({
        //     repeat: 100,
        //     yoyo: true,
        //     onComplete: () => {
        //         sl.kill();
        //     }
        // });
        // tl.add(sl);
        tl.to(searchScene.containerEle, { duration: 0, autoAlpha: 1 })
        // sl.fromTo(
        //     searchScene.searchEle,
        //     { scaleX: 0.9, scaleY: 0.9 },
        //     { duration: 0.5, scaleX: 1.1, scaleY: 1.1, ease: "power2.inOut" }, ">"
        // );
        // sl.play();
        if (!timeline)
            tl.play();
    }, [scenes]);

    const closeSearch = useCallback((timeline: any) => {

        const searchScene = scenes.get(SCENE_NAME.BATTLE_SEARCH) as SearchScene;

        if (!searchScene.containerEle || !searchScene.searchEle) return;

        const cl = gsap.timeline({
            // repeat: 100,
            // yoyo: true,
        });
        const tl = timeline ?? gsap.timeline({
            onComplete: () => {
                tl.kill();
            }
        });
        tl.add(cl, "<")
        tl.to(searchScene.containerEle, { autoAlpha: 0, duration: 0.5 });
        cl.to(searchScene.searchEle, { autoAlpha: 0, duration: 0.5 })

        if (!timeline)
            tl.play();
    }, [scenes]);

    return { playSearch, closeSearch, playMatching, playCloseMatching }
}
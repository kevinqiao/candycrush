import { gsap } from "gsap";
import { useCallback, useEffect } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { useBattleManager } from "../../service/BattleManager";
import { useSceneManager } from "../../service/SceneManager";
import { ANIMATE_EVENT_TYPE, ANIMATE_NAME } from "./AnimateConstants";
import { Animate, IAnimateHandleContext } from "./AnimateManager";
import useBattleBoard from "./battle/BattleBoard";
import useBattleMatching from "./battle/BattleMatching";
import useGameReady from "./game/GameReady";
import useSolveSmesh from "./game/SolveSmesh";
import useSolveSwap from "./game/SolveSwap";
import useSwipeCandy from "./game/SwipeCandy";

export const useGameAnimateHandler = (props: IAnimateHandleContext) => {
    const { animates, animateEvent, removeAnimate } = props;
    const { swipeSuccess, swipeFail } = useSwipeCandy(props);
    const { solveSwap } = useSolveSwap(props);
    const { solveMesh } = useSolveSmesh(props);
    const { initGame } = useGameReady(props);
    const { closeBattleMatching } = useBattleMatching(props);
    const { scenes, sceneEvent } = useSceneManager();
    const { initBoard } = useBattleBoard(props);
    const { battle } = useBattleManager();


    const processGameInit = useCallback((animate: Animate) => {

        if (!animate.gameId) return;
        const timeline = gsap.timeline({
            onComplete: () => {
                removeAnimate(animate.id);
            }
        });
        animate.status = 1
        if (!animate.data.load) {
            const il = gsap.timeline();
            const ml = gsap.timeline({
                onComplete: () => {
                    const m = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_MATCHED);
                    if (m)
                        removeAnimate(m.id)
                }
            });
            initGame(animate.gameId, il);
            closeBattleMatching(ml);
            timeline.add(ml).add(il, ">-=0.8")
        } else {
            initGame(animate.gameId, timeline);
        }
        const sl = gsap.timeline();
        timeline.add(sl, "<");
        initBoard(sl, animate.data)
        timeline.play();
    }, [])

    const processSwipeSuccess = useCallback((animate: Animate) => {
        if (!animate.gameId) return;
        const { candy, target } = animate.data;
        const timeline = gsap.timeline({
            onComplete: () => {
                removeAnimate(animate.id)
            }
        });

        swipeSuccess(animate.gameId, candy, target, timeline);
        timeline.play();

    }, [])
    const processSwipeFail = useCallback((animate: Animate) => {
        if (!animate.gameId) return;
        const { candyId, targetId } = animate.data;
        const timeline = gsap.timeline({
            onComplete: () => {
                removeAnimate(animate.id)
            }
        });
        swipeFail(animate.gameId, candyId, targetId, timeline);
        timeline.play();
    }, [])


    useEffect(() => {
        if (battle) {
            battle.games.forEach((g) => {
                const actives = animates.filter((a) => a.status && a.gameId === g.gameId);
                if (actives.length === 0) {
                    const toactives = animates.filter((a) => !a.status && a.gameId === g.gameId && (a.name === ANIMATE_NAME.CANDY_SMESHED || a.name === ANIMATE_NAME.CANDY_SWAPPED));
                    if (toactives.length > 0) {
                        toactives.sort((a, b) => a.id - b.id);
                        const animate = toactives[0]
                        animate.status = 1;
                        const timeline = gsap.timeline({
                            onComplete: () => {
                                console.log("remove animate id:" + animate.id)
                                removeAnimate(animate.id);
                                timeline.kill()
                            }
                        });
                        switch (animate.name) {
                            case ANIMATE_NAME.CANDY_SWAPPED:
                                solveSwap(g.gameId, animate.data, timeline);
                                timeline.play();
                                break;
                            case ANIMATE_NAME.CANDY_SMESHED:
                                solveMesh(g.gameId, animate.data, timeline);
                                timeline.play();
                                break;
                            default:
                                break;
                        }

                    }
                }

            })
        }

    }, [battle, animateEvent, animates, processGameInit, sceneEvent, removeAnimate, solveSwap, solveMesh])

    useEffect(() => {
        if (animateEvent) {
            const ianimates = animates.filter((a) => a.name === ANIMATE_NAME.GAME_INITED);

            if (!battle?.load) {
                // console.log(ianimates)
                const manimate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_MATCHED);
                // console.log(manimate)
                console.log("games:" + battle?.games.length + " " + "animate size:" + ianimates.length)

                if (manimate && manimate.status === 2 && ianimates.length === battle?.games.length)
                    ianimates.forEach((animate) =>
                        processGameInit(animate)
                    )
            } else {
                if (ianimates.length === battle?.games.length)
                    ianimates.forEach((animate) =>
                        processGameInit(animate)
                    )
            }
        }
    }, [animateEvent, animates, battle, processGameInit, sceneEvent])
    useEffect(() => {
        if (animateEvent?.name) {
            if (!scenes.get(SCENE_NAME.BATTLE_CONSOLE)) return;
            if (animateEvent.type === ANIMATE_EVENT_TYPE.CREATE) {
                switch (animateEvent.name) {
                    case ANIMATE_NAME.SWIPE_SUCCESS:
                        processSwipeSuccess(animateEvent.animate);
                        break;
                    case ANIMATE_NAME.SWIPE_FAIL:
                        processSwipeFail(animateEvent.animate);
                        break;
                    default:
                        break;
                }
            }
        }
    }, [animateEvent, processGameInit, processSwipeFail, processSwipeSuccess, scenes])
}
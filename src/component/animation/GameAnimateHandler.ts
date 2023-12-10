import { gsap } from "gsap";
import { useEffect } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { useSceneManager } from "../../service/SceneManager";
import { ANIMATE_NAME } from "./AnimateConstants";
import { IAnimateContext } from "./AnimateManager";
import useBattleBoard from "./battle/BattleBoard";
import useBattleMatching from "./battle/BattleMatching";
import useCollectCandies from "./battle/CollectCandies";
import useGameReady from "./game/GameReady";
import useSolveSmesh from "./game/SolveSmesh";
import useSolveSwap from "./game/SolveSwap";
import useSwipeCandy from "./game/SwipeCandy";

export const useGameAnimateHandler = (props: IAnimateContext) => {
    const { animates, animateEvent, removeAnimate } = props;
    const { swipeSuccess, swipeFail } = useSwipeCandy(props);
    const { solveSwap } = useSolveSwap(props);
    const { solveMesh } = useSolveSmesh(props);
    const { playCollect } = useCollectCandies();
    const { initGame } = useGameReady(props);
    const { closeBattleMatching } = useBattleMatching(props);
    const { scenes, sceneEvent } = useSceneManager();
    const { initBoard, changeGoal } = useBattleBoard(props);

    useEffect(() => {

        const animate = animates.find((a) => a.name === ANIMATE_NAME.GAME_INITED);
        let manimate: any = null;
        if (animate && !animate.status) {
            const gameId = animate.data.gameId;
            if (!scenes.get(gameId) || !scenes.get(SCENE_NAME.BATTLE_CONSOLE)) return;

            if (!animate.data.load) {
                manimate = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_MATCHED);
                if (!manimate || manimate.status !== 2)
                    return;
            }
            const timeline = gsap.timeline({
                onComplete: () => {
                    if (manimate)
                        removeAnimate(manimate.id);
                    removeAnimate(animate.id)
                }
            });
            animate.status = 1;
            if (!animate.data.load) {
                const il = gsap.timeline();
                const ml = gsap.timeline();
                initGame(gameId, il);
                closeBattleMatching(ml);
                timeline.add(ml).add(il, ">-=0.8")
            } else {
                initGame(gameId, timeline);
            }
            console.log(animate.data)
            const sl = gsap.timeline();
            timeline.add(sl, "<");
            initBoard(sl, animate.data)
            timeline.play();

        }
    }, [animateEvent, animates, closeBattleMatching, initGame, initBoard, removeAnimate, sceneEvent, scenes])
    useEffect(() => {
        if (animateEvent?.name) {
            switch (animateEvent.name) {

                case ANIMATE_NAME.SWIPE_SUCCESS:
                    const sanimate = animates.find((a) => a.name === ANIMATE_NAME.SWIPE_SUCCESS);
                    if (!sanimate || !sanimate.gameId) return;
                    const { candy, target } = sanimate.data;
                    swipeSuccess(sanimate.gameId, candy, target, null);
                    break;
                case ANIMATE_NAME.SWIPE_FAIL:
                    const fanimate = animates.find((a) => a.name === ANIMATE_NAME.SWIPE_FAIL);
                    if (!fanimate || !fanimate.gameId) return;
                    const { candyId, targetId } = fanimate.data;
                    swipeFail(fanimate.gameId, candyId, targetId, null);
                    break;
                case ANIMATE_NAME.CANDY_SWAPPED:
                    const wanimate = animates.find((a) => a.name === ANIMATE_NAME.CANDY_SWAPPED);
                    if (!wanimate || !wanimate.gameId) return;
                    solveSwap(wanimate.gameId, wanimate.data, null)
                    break;
                case ANIMATE_NAME.CANDY_SMESHED:
                    const manimate = animates.find((a) => a.name === ANIMATE_NAME.CANDY_SMESHED);
                    if (!manimate || !manimate.gameId) return;
                    solveMesh(manimate.gameId, manimate.data, null)
                    break;
                case ANIMATE_NAME.GOAL_COLLECT:
                    const canimate = animates.find((a) => a.name === ANIMATE_NAME.GOAL_COLLECT && a.id === animateEvent.animateId);
                    if (!canimate) return;
                    removeAnimate(canimate.id)
                    const tl = gsap.timeline();
                    playCollect(canimate.data.gameId, canimate.data.cells, tl);
                    if (canimate.data.goal && canimate.data.goal.length > 0) {
                        const gl = gsap.timeline();
                        tl.add(gl, ">")
                        console.log(canimate.data)
                        changeGoal(canimate.data.gameId, canimate.data.goal, gl)
                    }
                    tl.play();
                    break;
                default:
                    break;
            }
        }
    }, [animateEvent])



}
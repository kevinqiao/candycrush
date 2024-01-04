import { gsap } from "gsap";
import { useCallback, useEffect } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { useBattleManager } from "../../service/BattleManager";
import { useSceneManager } from "../../service/SceneManager";
import { ANIMATE_EVENT_TYPE, ANIMATE_NAME } from "./AnimateConstants";
import { IAnimateHandleContext } from "./AnimateManager";
import useSolveSmesh from "./game/SolveSmesh";
import useSolveSwap from "./game/SolveSwap";
import useSwipeCandy from "./game/SwipeCandy";

export const useGameAnimateHandler = (props: IAnimateHandleContext) => {
    const { animates, animateEvent, removeAnimate } = props;
    const { swipeSuccess, swipeFail } = useSwipeCandy(props);
    const { solveSwap } = useSolveSwap(props);
    const { solveMesh } = useSolveSmesh(props); 
    
    const { scenes, sceneEvent } = useSceneManager();
     const { battle } = useBattleManager();

    const processSwipeSuccess = useCallback((data:{gameId:string;candy:any;target:any}) => {
        const timeline = gsap.timeline({
            onComplete: () => {
                timeline.kill()
            }
        });
        swipeSuccess(data.gameId, data.candy, data.target, timeline);
        timeline.play();

    }, [])
    const processSwipeFail = useCallback((data: {gameId:string;candyId:number;targetId:number}) => {
        const timeline = gsap.timeline({
            onComplete: () => {
              timeline.kill()
            }
        });
        swipeFail(data.gameId, data.candyId, data.targetId, timeline);
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
                        animate.startTime=Date.now();
                        const timeline = gsap.timeline({
                            onComplete: () => {        
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

    }, [battle, animateEvent, animates,  sceneEvent, removeAnimate, solveSwap, solveMesh])


    useEffect(() => {
        if (animateEvent?.name) {
            if (!scenes.get(SCENE_NAME.BATTLE_CONSOLE)) return;
            if (animateEvent.type === ANIMATE_EVENT_TYPE.CREATE) {
                switch (animateEvent.name) {
                    case ANIMATE_NAME.SWIPE_SUCCESS:
                        processSwipeSuccess(animateEvent.data);
                        break;
                    case ANIMATE_NAME.SWIPE_FAIL:
                        processSwipeFail(animateEvent.data);
                        break;
                    default:
                        break;
                }
            }
        }
    }, [animateEvent, processSwipeFail, processSwipeSuccess, scenes])
}
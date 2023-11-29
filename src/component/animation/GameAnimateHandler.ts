import { useEffect } from "react";
import { ANIMATE_NAME } from "./AnimateConstants";
import { IAnimateContext } from "./AnimateManager";
import useSolveSmesh from "./game/SolveSmesh";
import useSolveSwap from "./game/SolveSwap";
import useSwipeCandy from "./game/SwipeCandy";

export const useGameAnimateHandler = (props: IAnimateContext) => {
    const { animates, animateEvent } = props;
    const { swipeSuccess, swipeFail } = useSwipeCandy(props);
    const { solveSwap } = useSolveSwap(props);
    const { solveMesh } = useSolveSmesh(props)

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
                    console.log(wanimate.data)
                    solveSwap(wanimate.gameId, wanimate.data, null)
                    break;
                case ANIMATE_NAME.CANDY_SMESHED:
                    const manimate = animates.find((a) => a.name === ANIMATE_NAME.CANDY_SWAPPED);
                    if (!manimate || !manimate.gameId) return;
                    solveMesh(manimate.gameId, manimate.data, null)
                    break;
                default:
                    break;
            }
        }
    }, [animateEvent])


    const processCandySmeshed = () => {

    }


}
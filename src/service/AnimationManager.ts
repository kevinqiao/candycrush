import { gsap } from "gsap";
import { useEffect } from "react";
import playCreate from "../component/animation/createCandies";
import playMove from "../component/animation/moveCandies";
import playRemove from "../component/animation/removeCandies";
import playSwipeFail from "../component/animation/swipeFail";
import playSwipeSuccess from "../component/animation/swipeSuccess";
import { CellItem } from "../model/CellItem";
import { GameModel } from "../model/GameModel";
import useCoord from "./CoordManager";
import useEventSubscriber from "./EventManager";
const useAnimationManager = (candiesMapRef: any, game: GameModel | null) => {
  const { event } = useEventSubscriber(["gameInited", "matchSolved", "candySwapped"], ["animation"]);
  const { cellW } = useCoord();

  const swipeSuccess = async (candy: CellItem, target: CellItem) => {
    if (candy && target)
      playSwipeSuccess(candy, target, candiesMapRef.current, cellW);
  }

  const swipeFail = async (candy: CellItem, target: CellItem) => {
    if (candy && target)
      playSwipeFail(candy, target, candiesMapRef.current, cellW);
  };

  const solveMatch = async (res: { toMove: CellItem[], toRemove: CellItem[], toCreate?: CellItem[] }, mode: number) => {
    if (game) {
      console.log(candiesMapRef.current.keys())
      const timeline = gsap.timeline();
      const { toMove, toRemove, toCreate } = res;
      if (toMove?.length > 0) {
        playMove(toMove, candiesMapRef.current, cellW, timeline);
      }
      if (toRemove) {
        playRemove(toRemove, candiesMapRef.current, timeline, mode);
      }
      if (toCreate) {
        playCreate(toCreate, candiesMapRef.current, cellW, timeline);
      }

      timeline.play();

    };
  }
  useEffect(() => {

    if (event?.name === "candySwapped") {
      const { candy, target } = event.data
      swipeSuccess(candy, target)
    }

  }, [event])
  return { solveMatch, swipeSuccess, swipeFail };
};
export default useAnimationManager;



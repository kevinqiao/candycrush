import { gsap } from "gsap";
import playCreate from "../component/animation/createCandies";
import playMove from "../component/animation/moveCandies";
import playRemove from "../component/animation/removeCandies";
import playSwipeFail from "../component/animation/swipeFail";
import playSwipeSuccess from "../component/animation/swipeSuccess";
import { CellItem } from "../model/CellItem";
const useAnimationManager = (candiesMapRef: any, cellW: number, pid: string | undefined) => {
  // const { event } = useEventSubscriber(["gameInited", "matchSolved", "candySwapped"], [game ? game.gameId : "animation"]);
  // const { cellW } = useCoord();

  const swipeSuccess = async (candy: CellItem, target: CellItem) => {
    const ids = Array.from(candiesMapRef.current.keys()) as number[]
    ids.sort((a, b) => a - b);
    // console.log(ids)
    if (candy && target) {
      playSwipeSuccess(candy, target, candiesMapRef.current, cellW);
    }
  }

  const swipeFail = async (candy: CellItem, target: CellItem) => {
    if (candy && target)
      playSwipeFail(candy, target, candiesMapRef.current, cellW);
  };

  const solveMatch = async (res: { toMove: CellItem[], toRemove: CellItem[], toCreate?: CellItem[] }, mode: number) => {
    const ids = Array.from(candiesMapRef.current.keys()) as number[]
    ids.sort((a, b) => a - b);

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

  }
  // useEffect(() => {

  //   if (event?.name === "candySwapped") {
  //     const { candy, target } = event.data
  //     swipeSuccess(candy, target)
  //   }

  // }, [event])
  return { solveMatch, swipeSuccess, swipeFail };
};
export default useAnimationManager;



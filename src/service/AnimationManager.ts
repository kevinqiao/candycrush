import { gsap } from "gsap";
import playCreate from "../component/animation/createCandies";
import playMove from "../component/animation/moveCandies";
import playRemove from "../component/animation/removeCandies";
import playSwipeFail from "../component/animation/swipeFail";
import playSwipeSuccess from "../component/animation/swipeSuccess";
import { CellItem } from "../model/CellItem";
const useAnimationManager = (candiesMapRef: any, cellWRef: React.MutableRefObject<number>, pid: string | undefined) => {
  // const { event } = useEventSubscriber(["gameInited", "matchSolved", "candySwapped"], [game ? game.gameId : "animation"]);
  // const { cellW } = useCoord();

  const swipeSuccess = async (candy: CellItem, target: CellItem) => {

    const ids = Array.from(candiesMapRef.current.keys()) as number[]
    ids.sort((a, b) => a - b);
    // console.log(ids)
    if (candy && target) {
      playSwipeSuccess(candy, target, candiesMapRef.current, cellWRef.current);
    }
  }

  const swipeFail = async (candy: CellItem, target: CellItem) => {
    if (candy && target)
      playSwipeFail(candy, target, candiesMapRef.current, cellWRef.current);
  };

  const solveMatch = async (res: { toMove?: CellItem[]; toRemove?: CellItem[]; toCreate?: CellItem[] }, timeline: any) => {


    const { toMove, toRemove, toCreate } = res;
    if (toRemove && timeline) {
      playRemove(toRemove, candiesMapRef.current, timeline);
    }
    if (toMove && timeline) {
      playMove(toMove, candiesMapRef.current, cellWRef.current, timeline);
    }

    if (toCreate && timeline) {
      playCreate(toCreate, candiesMapRef.current, cellWRef.current, timeline);
    }



  }
  // useEffect(() => {

  //   if (event?.name === "candySwapped") {
  //     const { candy, target } = event.data
  //     swipeSuccess(candy, target)
  //   }

  // }, [event])
  const solveMatches = (matches: any[]) => {
    const master = gsap.timeline();
    let count = 0;
    for (let match of matches) {
      console.log("match id:" + match.id)
      const tl = gsap.timeline();
      solveMatch(match, tl);
      master.add(tl, "+=" + count * 0.3);
      count++
    }
    master.play()

  }
  return { solveMatches, swipeSuccess, swipeFail };
};
export default useAnimationManager;



import { gsap } from "gsap";
import { createContext, useContext } from "react";
import useCollectCandies from "../component/animation/CollectCandies";
import playChange from "../component/animation/changeCandies";
import playMove from "../component/animation/moveCandies";
import useRemoveCandies from "../component/animation/removeCandies";
import playSwipeFail from "../component/animation/swipeFail";
import playSwipeSuccess from "../component/animation/swipeSuccess";
import { CellItem } from "../model/CellItem";
import { Match, checkMatches } from "./GameEngine";
import { useSceneManager } from "./SceneManager";
const getSwipeToChange = (cells: CellItem[]): { toChange: CellItem[]; toRemove: CellItem[] } => {
  const matches: Match[] = checkMatches(cells);
  const toChange: CellItem[] = [];
  matches
    .filter((match) => match.size > 3)
    .forEach((m) => {
      m.items[0].units.sort((a, b) => a.row + a.column - (b.row + b.column));
      const start = m.items[0].units[0];
      const end = m.items[0].units[m.items[0].units.length - 1];
      if (m.items[0].orientation === "horizontal") {
        [start.column, end.column] = [end.column, start.column];
        end.asset = 28;
      } else {
        [start.row, end.row] = [end.row, start.row];
        end.asset = 29;
      }
      end.status = 0;
      toChange.push(JSON.parse(JSON.stringify(end)));
    });

  const toRemove: CellItem[] = cells.filter((c: CellItem) => c.status && c.status > 0);

  return { toChange, toRemove };
};
interface IAnimateContext {
  animates: Map<
    string, //scene name
    {
      scene: string;
      timeline: any;
      starttime: number;
    }
  >;
}
const AnimateContext = createContext<IAnimateContext>({
  animates: new Map(),
});

export const AnimateProvider = ({ children }: { children: React.ReactNode }) => {
  const value = {
    animates: new Map(),
  };
  return <AnimateContext.Provider value={value}> {children} </AnimateContext.Provider>;
};

const useAnimationManager = () => {
  const { textures, scenes } = useSceneManager();
  const { animates } = useContext(AnimateContext);
  const { playCollect } = useCollectCandies();
  const { playRemove } = useRemoveCandies();

  const startSwipe = async (
    gameId: string,
    candy: CellItem,
    target: CellItem
    // res: { toChange?: CellItem[]; toMove?: CellItem[]; toRemove?: CellItem[]; toCreate?: CellItem[] }
  ) => {
    const master = gsap.timeline();
    const scene = scenes.get(gameId);
    if (!scene || !scene.candies || !scene.cwidth) return;
    [candy.row, target.row] = [target.row, candy.row];
    [candy.column, target.column] = [target.column, candy.column];
    const sl = gsap.timeline();
    master.add(sl);
    playSwipeSuccess(candy, target, scene.candies, scene.cwidth, sl);
    const ml = gsap.timeline();
    master.add(ml, ">");
    // const { toChange, toRemove } = res;
    // if (scene?.candies && scene?.cwidth && toChange && toChange.length > 0) {
    //   playChange(toChange, textures, scene.candies, scene.cwidth, ml);
    // }
    // if (scene?.candies && toRemove && toRemove.length > 0) {
    //   playRemove(toRemove, scene.candies, ml);
    //   ml.call(
    //     () => {
    //       const cl = gsap.timeline();
    //       playCollect(gameId, toRemove, cl);
    //       cl.play();
    //     },
    //     [],
    //     ">"
    //   );
    // }
    master.play();
  };
  const cancelSwipe = async (gameId: string, candy: CellItem, target: CellItem) => {
    const scene = scenes.get(gameId);
    if (scene?.candies && scene?.cwidth && candy && target) playSwipeFail(candy, target, scene.candies, scene.cwidth);
  };

  const solveMatch = async (
    gameId: string,
    res: { toChange?: CellItem[]; toMove?: CellItem[]; toRemove?: CellItem[]; toCreate?: CellItem[] },
    timeline: any
  ) => {
    const scene = scenes.get(gameId);

    const ml = gsap.timeline();
    timeline.add(ml, ">");
    const { toChange, toMove, toRemove } = res;
    if (scene?.candies && scene?.cwidth && toChange && toChange.length > 0) {
      playChange(toChange, textures, scene.candies, scene.cwidth, ml);
    }
    if (scene?.candies && toRemove && toRemove.length > 0) {
      playRemove(toRemove, scene.candies, ml);
      ml.call(
        () => {
          const cl = gsap.timeline();
          playCollect(gameId, toRemove, cl);
          cl.play();
        },
        [],
        ">-0.1"
      );
    }

    if (toMove && scene?.candies && scene.cwidth) {
      playMove(toMove, scene.candies, scene.cwidth, ml);
    }
  };

  const solveSwipe = (
    gameId: string,
    data: {
      candy: CellItem;
      target: CellItem;
      results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[];
    }
  ) => {
    console.log(data.results);
    const scene = scenes.get(gameId);
    if (scene?.candies) {
      const cells = Array.from(scene.candies.values()).map((c) => c.data);
      cells.sort((a, b) => (a.row !== b.row ? a.row - b.row : a.column - b.column));
      console.log(JSON.parse(JSON.stringify(cells)));
    }

    const master = gsap.timeline({
      onComplete: () => {
        if (scene?.candies) {
          const cells = Array.from(scene.candies.values()).map((c) => c.data);
          cells.sort((a, b) => (a.row !== b.row ? a.row - b.row : a.column - b.column));
          console.log(JSON.parse(JSON.stringify(cells)));
        }
      },
    });
    const candy = scene?.candies?.get(data.candy.id)?.data;
    const target = scene?.candies?.get(data.target.id)?.data;
    if (target && candy && scene?.candies && scene?.cwidth) {
      Object.assign(candy, data.candy);
      Object.assign(target, data.target);
      const sl = gsap.timeline();
      playSwipeSuccess(data.candy, data.target, scene.candies, scene.cwidth, sl);
      master.add(sl);
    }
    data.results.forEach((res) => {
      const ml = gsap.timeline();
      master.add(ml, ">");
      solveMatch(gameId, res, ml);
    });
    master.play();
  };

  const solveSmesh = (
    gameId: string,
    data: {
      candyId: number;
      results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[];
    }
  ) => {
    const sl = gsap.timeline();
    data.results.forEach((res) => solveMatch(gameId, res, sl));
    sl.play();
  };
  return { solveSwipe, solveSmesh, startSwipe, cancelSwipe };
};
export default useAnimationManager;

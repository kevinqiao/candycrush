import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import playChange from "../component/animation/changeCandies";
import playMove from "../component/animation/moveCandies";
import useRemoveCandies from "../component/animation/removeCandies";
import playSwipeFail from "../component/animation/swipeFail";
import playSwipeSuccess from "../component/animation/swipeSuccess";
import { CandyModel } from "../model/CandyModel";
import { CellItem } from "../model/CellItem";
import { Match, checkMatches } from "./GameEngine";
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

const useAnimationManager = (
  textures: { id: number; texture: PIXI.Texture }[] | undefined,
  candiesMapRef: any,
  cellWRef: React.MutableRefObject<number>,
) => {

  const { playRemove } = useRemoveCandies();
  const startSwipe = async (candy: CellItem, target: CellItem) => {
    const master = gsap.timeline();
    const sl = gsap.timeline();
    const ml = gsap.timeline();
    master.add(sl).add(ml)[(candy.row, target.row)] = [target.row, candy.row];
    [candy.column, target.column] = [target.column, candy.column];
    playSwipeSuccess(candy, target, candiesMapRef.current, cellWRef.current, sl);

    const cells: CellItem[] = Array.from(candiesMapRef.current.values()).map((v) => (v as CandyModel).data);
    const { toChange, toRemove } = getSwipeToChange(cells);
    if (toChange && toChange.length > 0) {
      toChange.forEach((c) => {
        const candy = candiesMapRef.current.get(c.id);
        const texture = textures?.find((t) => t.id === c.asset);
        if (texture) {
          Object.assign(candy.data, c);
          candy.sprite.texture = texture.texture;
        }
      });
      playChange(toChange, candiesMapRef.current, cellWRef.current, ml);
    }
    if (toRemove && toRemove.length > 0) {
      playRemove(toRemove, candiesMapRef.current, ml);
    }
    master.play();
  };

  const cancelSwipe = async (candy: CellItem, target: CellItem) => {
    if (candy && target) playSwipeFail(candy, target, candiesMapRef.current, cellWRef.current);
  };

  const solveMatch = async (
    res: { toChange?: CellItem[]; toMove?: CellItem[]; toRemove?: CellItem[]; toCreate?: CellItem[] },
    timeline: any
  ) => {
    const rl = gsap.timeline();
    const ml = gsap.timeline();
    timeline.add(rl).add(ml, "+=0.1");

    const { toChange, toMove, toRemove } = res;
    if (toChange && toChange.length > 0) {
      toChange.forEach((c) => {
        const candy = candiesMapRef.current.get(c.id);
        const texture = textures?.find((t) => t.id === c.asset);
        if (texture) {
          // const sprite = new PIXI.Sprite(texture.texture);
          Object.assign(candy.data, c);
          candy.sprite.texture = texture.texture;
        }
      });
      playChange(toChange, candiesMapRef.current, cellWRef.current, rl);
    }
    if (toRemove && toRemove.length > 0) {
      playRemove(toRemove, candiesMapRef.current, rl);
    }

    if (toMove) {
      playMove(toMove, candiesMapRef.current, cellWRef.current, ml);
    }
  };

  const solveSwipe = (data: {
    candy: CellItem;
    target: CellItem;
    results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[];
  }) => {
    const master = gsap.timeline();
    const candy = candiesMapRef.current.get(data.candy.id)?.data;
    const target = candiesMapRef.current.get(data.target.id)?.data;
    if (target && candy) {
      Object.assign(candy, data.candy);
      Object.assign(target, data.target);
      const sl = gsap.timeline();
      playSwipeSuccess(data.candy, data.target, candiesMapRef.current, cellWRef.current, sl);
      master.add(sl);
    }
    const ml = gsap.timeline();
    master.add(ml);
    data.results.forEach((res) => solveMatch(res, ml));
    master.play();
  };
  const solveSmesh = (data: {
    candyId: number;
    results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[];
  }) => {
    const sl = gsap.timeline();
    data.results.forEach((res) => solveMatch(res, sl));
    sl.play();
  };
  return { solveSwipe, solveSmesh, startSwipe, cancelSwipe };
};
export default useAnimationManager;

import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import { CellItem } from "../../../model/CellItem";
import playCreate from "./createCandies";
import playMove from "./moveCandies";
import playRemove from "./removeCandies";
const useSmeshManager = (textures: { id: number; texture: PIXI.Texture }[] | undefined, candiesMapRef: any, cellWRef: React.MutableRefObject<number>, pid: string | undefined) => {

  const solveSmesh = ({ toCreate, toMove, toRemove, cell }: { toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[]; cell: CellItem }) => {
    const master = gsap.timeline();
    const rl = gsap.timeline();
    const ml = gsap.timeline();
    master.add(rl).add(ml, "+=0.1")


    if (toRemove && toRemove.length > 0) {
      playRemove(toRemove, candiesMapRef.current, rl);
    }

    if (toMove && toMove.length > 0) {
      playMove(toMove, candiesMapRef.current, cellWRef.current, ml);
    }

    if (toCreate && toCreate.length > 0) {
      playCreate(toCreate, candiesMapRef.current, cellWRef.current, ml);
    }

    master.play()

  }
  return { solveSmesh };
};
export default useSmeshManager;



import { CellItem } from "../../model/CellItem";
import { CandySprite } from "../pixi/CandySprite";

const play = (candy: CellItem, target: CellItem, candyMap: Map<Number, CandySprite>, cellW: number, tl: any) => {

    const candySprite = candyMap.get(candy.id)
    const targetSprite = candyMap.get(target.id)
    if (candySprite && targetSprite) {
        const tx = target.column * cellW + Math.floor(cellW / 2);
        const ty = target.row * cellW + Math.floor(cellW / 2);
        console.log(tx + ":" + ty + ":" + target.column + ":" + cellW)
        tl.to(
            targetSprite,
            {
                x: tx,
                y: ty,
                duration: 0.3,
                ease: 'power2.out',
            }, "<")
        const cx = candy.column * cellW + Math.floor(cellW / 2);
        const cy = candy.row * cellW + Math.floor(cellW / 2);
        console.log(cx + ":" + cy + ":" + candy.column + ":" + cellW)
        tl.to(
            candySprite,
            {
                x: cx,
                y: cy,
                duration: 0.3,
                ease: 'power2.out',
            }, "<");

    }


}
export default play
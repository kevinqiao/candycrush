import { gsap } from "gsap/gsap-core";
import { CandyModel } from "../../model/CandyModel";
import { CellItem } from "../../model/CellItem";
const play = (candy: CellItem, target: CellItem, candyMap: Map<Number, CandyModel>, cellW: number) => {


    const tl = gsap.timeline();
    if (target && candy) {

        const candySprite = candyMap.get(candy.id)?.sprite
        const targetSprite = candyMap.get(target.id)?.sprite
        if (candySprite && targetSprite) {
            console.log("swipe success;")
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
                }, 0)
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
                }, 0);
            tl.play();
        }
    }
}
export default play
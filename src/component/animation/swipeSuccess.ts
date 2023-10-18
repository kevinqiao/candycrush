import { gsap } from "gsap/gsap-core";
import { CandyModel } from "../../model/CandyModel";
import { CellItem } from "../../model/CellItem";
const play = (candy: CellItem, target: CellItem, candyMap: Map<Number, CandyModel>, cellW: number) => {


    const tl = gsap.timeline();
    if (target && candy) {

        const candySprite = candyMap.get(candy.id)?.sprite
        const targetSprite = candyMap.get(target.id)?.sprite
        if (candySprite && targetSprite) {
            console.log("swipe success")
            tl.to(
                targetSprite,
                {
                    x: target.column * cellW + Math.floor(cellW / 2),
                    y: target.row * cellW + Math.floor(cellW / 2),
                    duration: 0.4,
                    ease: 'power2.out',
                }, 0)

            tl.to(
                candySprite,
                {
                    x: candy.column * cellW + Math.floor(cellW / 2),
                    y: candy.row * cellW + Math.floor(cellW / 2),
                    duration: 0.4,
                    ease: 'power2.out',
                }, 0);
            tl.play();
        }
    }
}
export default play
import { gsap } from "gsap/gsap-core";
import { CellItem } from "../../model/CellItem";
import { CandySprite } from "../pixi/CandySprite";
const play = (candy: CellItem, target: CellItem, candyMap: Map<Number, CandySprite>, cellW: number) => {
    const candyTimeline = gsap.timeline();
    const targetTimeline = gsap.timeline();
    if (target && candy) {
        const candySprite = candyMap.get(candy.id)
        const targetSprite = candyMap.get(target.id)
        if (candySprite && targetSprite) {
            if (candy && target) {
                targetTimeline.to(
                    targetSprite,
                    {
                        x: candy.column * cellW + Math.floor(cellW / 2),
                        y: candy.row * cellW + Math.floor(cellW / 2),
                        duration: 0.2,
                        ease: 'power2.out',
                    }, 0).to(
                        targetSprite,
                        {
                            x: target.column * cellW + Math.floor(cellW / 2),
                            y: target.row * cellW + Math.floor(cellW / 2),
                            duration: 0.2,
                            ease: 'power2.out',
                        }, 0.2)

                candyTimeline.to(
                    candySprite,
                    {
                        x: target.column * cellW + Math.floor(cellW / 2),
                        y: target.row * cellW + Math.floor(cellW / 2),
                        duration: 0.2,
                        ease: 'power2.out',
                    }, 0).to(
                        candySprite,
                        {
                            x: candy.column * cellW + Math.floor(cellW / 2),
                            y: candy.row * cellW + Math.floor(cellW / 2),
                            duration: 0.2,
                            ease: 'power2.out',
                        }, 0.2)
            }
        }
    }
}
export default play
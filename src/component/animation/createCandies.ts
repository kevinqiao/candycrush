import { CellItem } from "../../model/CellItem";
import { CandySprite } from "../pixi/CandySprite";
const play = (cells: CellItem[], candyMap: Map<Number, CandySprite>, cellW: number, tl: any) => {

    // const tl = gsap.timeline();
    cells.forEach((c) => {
        const candy = candyMap.get(c.id)
        if (candy) {
            tl.to(
                candy,
                {
                    x: c.column * cellW + Math.floor(cellW / 2),
                    y: c.row * cellW + Math.floor(cellW / 2),
                    duration: 0.4,
                    ease: 'power2.out',
                }, "<")
        }
    })

    // tl.play();

}
export default play
import * as PIXI from "pixi.js";
import { CellItem } from "../../model/CellItem";
import { CandySprite } from "../pixi/CandySprite";
const useChangeCandies = () => {
    const playChange = (cells: CellItem[], textures: { id: number; texture: PIXI.Texture }[], candyMap: Map<Number, CandySprite>, cellW: number, tl: any) => {

        cells.forEach((c) => {
            const candy = candyMap.get(c.id);
            if (candy) {
                tl.to(
                    candy,
                    {
                        onStart: () => {
                            const texture = textures?.find((t) => t.id === c.asset);
                            if (texture && candy) {
                                // Object.assign(candy.data, c);
                                candy.texture = texture.texture;
                            }
                        },
                        x: c.column * cellW + Math.floor(cellW / 2),
                        y: c.row * cellW + Math.floor(cellW / 2),
                        duration: 0.3,
                        ease: 'power2.out',
                    }, "<")
            }
        })

    }
    return { playChange }
}
export default useChangeCandies
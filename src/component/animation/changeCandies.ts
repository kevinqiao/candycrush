import * as PIXI from "pixi.js";
import { CandyModel } from "../../model/CandyModel";
import { CellItem } from "../../model/CellItem";
const play = (cells: CellItem[], textures: { id: number; texture: PIXI.Texture }[], candyMap: Map<Number, CandyModel>, cellW: number, tl: any) => {

    cells.forEach((c) => {
        //   const candy = scene?.candies?.get(c.id);

        const candy = candyMap.get(c.id);
        if (candy) {
            // Object.assign(candy.data, c)
            const sprite = candy.sprite
            if (sprite)
                tl.to(
                    sprite,
                    {
                        onStart: () => {
                            const texture = textures?.find((t) => t.id === c.asset);
                            if (texture && candy) {
                                Object.assign(candy.data, c);
                                candy.sprite.texture = texture.texture;
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
export default play
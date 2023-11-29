import * as PIXI from "pixi.js";
import { CellItem } from "../../../model/CellItem";
import { SceneModel } from "../../../service/SceneManager";
type Texture = {
    id: number;
    texture: PIXI.Texture;
}
export const playChange = (toChange: CellItem[], gameScene: SceneModel, textures: Texture[], tl: any) => {
    const candyMap = gameScene.candies;
    const cwidth = gameScene.cwidth;
    if (candyMap && cwidth) {
        toChange.forEach((c) => {
            const candy = candyMap.get(c.id);
            if (candy) {
                tl.to(
                    candy,
                    {
                        onStart: () => {
                            const texture = textures?.find((t) => t.id === c.asset);
                            if (texture && candy) {
                                console.log("texture:" + c.asset)
                                candy.texture = texture.texture;
                            }
                        },
                        x: c.column * cwidth + Math.floor(cwidth / 2),
                        y: c.row * cwidth + Math.floor(cwidth / 2),
                        duration: 0.3,
                        ease: 'power2.out',
                    }, "<")
            }
        })
    }
}
export const playMove = (toMove: CellItem[], gameScene: SceneModel, textures: Texture[], tl: any) => {
    const candyMap = gameScene.candies;
    const cwidth = gameScene.cwidth;
    if (candyMap && cwidth)
        toMove.forEach((c) => {
            const candy = candyMap.get(c.id);
            if (candy) {
                tl.to(
                    candy,
                    {
                        x: c.column * cwidth + Math.floor(cwidth / 2),
                        y: c.row * cwidth + Math.floor(cwidth / 2),
                        duration: 0.4,
                        ease: 'power2.out',
                    }, "<")
            }
        })
}

export const playRemove = (toRemove: CellItem[], gameScene: SceneModel, textures: Texture[], tl: any) => {
    const candyMap = gameScene.candies;
    if (candyMap)
        toRemove.forEach((c) => {
            const candy = candyMap.get(c.id);
            if (candy) {
                candyMap.delete(c.id);
                tl.to(
                    candy,
                    {
                        alpha: 0,
                        duration: 0.3,
                        ease: 'power2.out',
                        onComplete: function () {
                            candy.destroy()
                        },

                    }, "<");
            }
        })
    // tl.call(
    //     () => {
    //         const cl = gsap.timeline();
    //         playCollect(gameId, toRemove, cl);
    //         cl.play();
    //     },
    //     [],
    //     ">-0.1"
    // );
}


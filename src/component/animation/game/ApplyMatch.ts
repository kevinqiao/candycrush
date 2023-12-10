import * as PIXI from "pixi.js";
import { CellItem } from "../../../model/CellItem";
import { GameScene } from "../../../model/SceneModel";

type Texture = {
    id: number;
    texture: PIXI.Texture;
}
export const playChange = (toChange: CellItem[], gameScene: GameScene, textures: Texture[], tl: any) => {
    const candyMap = gameScene.candies;
    const cwidth = gameScene.cwidth;
    if (candyMap && cwidth) {
        toChange.forEach((c) => {
            const candy = candyMap.get(c.id);
            if (candy) {
                const cx = c.column * cwidth + Math.floor(cwidth / 2);
                const cy = c.row * cwidth + Math.floor(cwidth / 2);
                candy.column = c.column;
                candy.row = c.row;
                tl.to(
                    candy,
                    {
                        onStart: () => {
                            const texture = textures?.find((t) => t.id === c.asset);
                            if (texture && candy) {
                                candy.texture = texture.texture;
                            }
                        },
                        x: cx,
                        y: cy,
                        duration: 0.1,
                        ease: 'power2.out',
                    }, "<")
            }
        })
    }
}
export const playMove = (toMove: CellItem[], gameScene: GameScene, textures: Texture[], tl: any) => {
    const candyMap = gameScene.candies;
    const cwidth = gameScene.cwidth;
    if (candyMap && cwidth)
        toMove.forEach((c) => {
            const candy = candyMap.get(c.id);
            if (candy) {
                const cx = c.column * cwidth + Math.floor(cwidth / 2);
                const cy = c.row * cwidth + Math.floor(cwidth / 2);
                candy.column = c.column;
                candy.row = c.row;
                tl.to(
                    candy,
                    {
                        x: cx,
                        y: cy,
                        duration: 1,
                        ease: 'power2.out',
                    }, "<")
            }
        })
}

export const playRemove = (toRemove: CellItem[], gameScene: GameScene, textures: Texture[], tl: any) => {
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
                        duration: 1,
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


import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import { CellItem } from "../../model/CellItem";
import { COLUMN } from "../../model/Constants";

const useCollectCandies = (scene: PIXI.Application | undefined, textures: { id: number; texture: PIXI.Texture }[] | undefined,) => {

    const playCollect = (cells: CellItem[]) => {
        if (cells?.length > 0 && scene && textures) {
            const tl = gsap.timeline();
            const width = scene.view.width;
            const height = scene.view.height;
            const cwidth = Math.floor(0.8 * scene.view.width / COLUMN);
            cells.forEach((cell, index) => {
                const texture = textures?.find((d) => d.id === cell.asset);
                if (texture && scene?.stage) {
                    const sprite = new PIXI.Sprite(texture.texture);
                    sprite.anchor.set(0.5);
                    sprite.width = cwidth;
                    sprite.height = cwidth;
                    const x = width * 0.1 + cell.column * cwidth + Math.floor(cwidth / 2);
                    const y = height * 0.3 + 60 + cwidth * cell.row + Math.floor(cwidth / 2);
                    sprite.x = x;
                    sprite.y = y;
                    scene.stage.addChild(sprite);
                    tl.to(
                        sprite,
                        {
                            alpha: 0,
                            x: width / 2,
                            y: height * 0.2,
                            duration: 1,
                            ease: 'expo.in',
                            onComplete: function () {
                                sprite.destroy()
                            },

                        }, 0.4);
                }
            })
        }
    }
    return { playCollect }


}
export default useCollectCandies
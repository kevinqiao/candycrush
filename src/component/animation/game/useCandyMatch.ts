import { gsap } from "gsap";
import { CellItem } from "model/CellItem";
import * as PIXI from "pixi.js";
import { useCallback } from "react";
import { GameScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import useCollectCandies from "../battle/useCollectCandies";
import useSwipeCandy from "./useSwipeCandy";


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
                        duration: 0.5,
                        ease: 'power2.out',
                    }, "<")
            }
        })
    }
}
export const playMove = (toMove: CellItem[], gameScene: GameScene, textures: Texture[], tl: any) => {
    // console.log(toMove);

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
                        duration: 0.9,
                        ease: 'power2.out',
                        // onStart: () => {
                        //     if (!candy || !candy.position) {
                        //         console.log("kill timeline")
                        //         tl.kill();
                        //     }
                        // },
                    }, "<")
            }
        })
}

export const playRemove = (toRemove: CellItem[], gameScene: GameScene, textures: Texture[], tl: any) => {
    const candyMap = gameScene.candies;
    if (candyMap) {

        toRemove.forEach((c) => {
            const candy = candyMap.get(c.id);
            if (candy) {
                // console.log("candy removed with:" + c.id)
                candyMap.delete(c.id)
                tl.to(
                    candy,
                    {
                        alpha: 0,
                        duration: 0.4,
                        ease: 'power2.out',
                        onComplete: () => {
                            candy.parent.removeChild(candy as PIXI.DisplayObject)
                            candy.destroy()
                        },
                        onStart: () => {
                            if (!candy || !candy.position) {
                                console.log("kill timeline")
                                tl.kill();
                            }
                        },

                    }, "<");
            } else {
                console.log("candy not found with:" + c.id)
            }
        })
    }

}

const useCandyMatch = () => {

    const { scenes, textures } = useSceneManager();
    const { swipeSuccess } = useSwipeCandy();
    const { playCollect } = useCollectCandies();


    const play = useCallback(
        (gameId: string, data: any, timeline: any) => {

            const gameScene: GameScene = scenes.get(gameId) as GameScene;
            const tl = timeline ?? gsap.timeline({
                onComplete: () => { tl.kill() }
            })
            const { results } = data;

            if (results && gameScene) {

                for (const res of results) {
                    const sl = gsap.timeline();
                    tl.add(sl, ">");
                    if (res.toRemove) {
                        const rl = gsap.timeline();
                        sl.add(rl, "<");
                        playRemove(res.toRemove, gameScene, textures, rl)
                        rl.call(
                            () => playCollect(gameId, res, null),
                            [],
                            "<"
                        );
                    }
                    if (res.toChange) {
                        const cl = gsap.timeline();
                        sl.add(cl, "<");
                        playChange(res.toChange, gameScene, textures, cl);
                    }

                    if (res.toMove) {
                        const ml = gsap.timeline();
                        sl.add(ml, ">-0.3");
                        playMove([...res.toMove, ...res.toCreate], gameScene, textures, ml)
                    }
                    // if (res.toCreate) {
                    //     const ct = gsap.timeline();
                    //     ml.add(ct, "<")
                    //     playMove(res.toCreate, gameScene, textures, ct)
                    // }

                }
            }
            if (!timeline)
                tl.play();
            else
                timeline.add(tl)
        },
        [playCollect, scenes, swipeSuccess, textures]
    );


    return { play };
};
export default useCandyMatch



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
                        onStart: () => {
                            if (!candy || !candy.position) {
                                console.log("kill timeline")
                                tl.kill();
                            }
                        },
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
                        duration: 1,
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
            const tl = timeline ?? gsap.timeline()
            const { candy, target, results } = data;
            swipeSuccess(gameId, candy, target, tl);
            if (results && gameScene) {

                for (const res of results) {
                    const ml = gsap.timeline();
                    tl.add(ml, ">");
                    const cl = gsap.timeline();
                    ml.add(cl)

                    if (res.toChange) {
                        playChange(res.toChange, gameScene, textures, cl);
                    }
                    if (res.toRemove) {
                        console.log(res.toRemove)
                        playRemove(res.toRemove, gameScene, textures, cl)
                        cl.call(
                            () => playCollect(gameId, res, null),
                            [],
                            "<"
                        );
                    }
                    if (res.toMove) {
                        const mt = gsap.timeline();
                        ml.add(mt, "<")
                        playMove(res.toMove, gameScene, textures, mt)
                    }

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



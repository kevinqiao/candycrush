import { CandySprite } from "component/pixi/CandySprite";
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

const buildSmesh = (candyMap: Map<number, CandySprite>, smesh: { target: number; candy: CellItem; smesh?: number[] }, tl: any) => {
    console.log(smesh)
    const candies: CandySprite[] = Array.from(candyMap.values());
    const candy = candyMap.get(smesh.candy.id);
    if (!candy) return;
    candy.status = 1;
    const cl = gsap.timeline();
    tl.add(cl);
    cl.to(
        candy,
        {
            alpha: 0,
            duration: 0.2,
            ease: 'power2.out',
        }, "<");
        
    const cells: CandySprite[] = candies.filter((c) => smesh.smesh && smesh.smesh.includes(c.id));
    const sl = gsap.timeline();
    tl.add(sl, ">");
    const ml = gsap.timeline();
    sl.add(ml, "<")
    cells.forEach((c, index) => {
        c.status = 1;
        ml.to(
            c,
            {
                alpha: 0,
                duration: 0.1,
                ease: 'power2.out',

            }, "<");

    })

    // switch (candy.asset) {
    //     case 28:
    //         {
    //             const cells: CandySprite[] = candies.filter((c) => smesh.smesh && smesh.smesh.includes(c.id));
    //             const sl = gsap.timeline();
    //             tl.add(sl, ">");
    //             const ml = gsap.timeline();
    //             sl.add(ml, "<")
    //             cells.forEach((c, index) => {
    //                 c.status = 1;
    //                 ml.to(
    //                     c,
    //                     {
    //                         alpha: 0,
    //                         duration: 0.1,
    //                         ease: 'power2.out',

    //                     }, "<");

    //             })
    //         }

    //         break;
    //     case 29:
    //         {
    //             const cells: CandySprite[] = candies.filter((c) => smesh.smesh && smesh.smesh.includes(c.id));
    //             const sl = gsap.timeline();
    //             tl.add(sl, ">");
    //             const ml = gsap.timeline();
    //             sl.add(ml, "<")
    //             cells.forEach((c, index) => {
    //                 c.status = 1;
    //                 ml.to(
    //                     c,
    //                     {
    //                         alpha: 0,
    //                         duration: 0.1,
    //                         ease: 'power2.out',

    //                     }, "<");
    //             })
    //         }
    //         break;

    //     default:
    //         break;
    // }
}
export const playSmesh = (toSmesh: { target: number; candy: CellItem }[][], gameScene: GameScene, tl: any) => {

    const candyMap = gameScene.candies;
    if (candyMap) {

        for (let i = 0; i < toSmesh.length; i++) {
            for (let j = 0; j < toSmesh[i].length; j++) {
                const mesh = toSmesh[i][j];
                if (mesh?.candy) {
                    const candy = candyMap.get(mesh.candy.id);
                    if (candy) {
                        const sl = gsap.timeline();
                        tl.add(sl, "<");
                        buildSmesh(candyMap, mesh, sl);
                    }
                }
            }
        }
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
            console.log(results)
            if (results && gameScene) {
                for (const res of results) {
                    const sl = gsap.timeline();
                    tl.add(sl, ">")
                    if (res.toSmesh) {
                        const cl = gsap.timeline(
                            {
                                onComplete: () => {
                                    const candyMap = gameScene.candies;
                                    const smeshs: { target: number; candy: CellItem; smesh: number[] }[][] = res.toSmesh;
                                    smeshs.flat().forEach((c) => {
                                        console.log(c.smesh)
                                        c.smesh.forEach((cid) => {
                                            const candy = candyMap.get(cid);
                                            if (candy) {
                                                candyMap.delete(cid)
                                                candy.parent.removeChild(candy as PIXI.DisplayObject)
                                                candy.destroy();
                                            }
                                        })
                                    })

                                }
                            }
                        );
                        sl.add(cl);
                        playSmesh(res.toSmesh, gameScene, cl);
                    }
                    if (res.toRemove) {
                        const cl = gsap.timeline();
                        res.toSmesh ? sl.add(cl, ">-=0.3") : sl.add(cl);
                        playRemove(res.toRemove, gameScene, textures, cl)
                        cl.call(
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
                        const cl = gsap.timeline();
                        sl.add(cl, ">");
                        playMove([...res.toMove, ...res.toCreate], gameScene, textures, cl)
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



import { CandySprite } from "component/pixi/CandySprite";
import { gsap } from "gsap";
import { CellItem } from "model/CellItem";
import * as PIXI from "pixi.js";
import { useCallback } from "react";
import { useGameManager } from "service/GameManager";
import { useUserManager } from "service/UserManager";
import { GameScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import useCollectCandies from "../battle/useCollectCandies";
import useSwipe from "./useSwipe";


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
                        duration: 0,
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
const useEvent = () => {
    const { game } = useGameManager();
    const { user } = useUserManager();
    const { scenes, textures } = useSceneManager();
    const { swipeSuccess } = useSwipe();
    const { playCollect } = useCollectCandies();


    const playApply = useCallback(
        (event: any) => {
            if (!game) return;
            const gameScene: GameScene = scenes.get(game.gameId) as GameScene;
            const tl = gsap.timeline({
                onComplete: () => {
                    tl.kill();
                }
            });

            if (event.name === "cellSwapped" && game.uid !== user.uid) {
                const sl = gsap.timeline();
                tl.add(sl, "<")
                swipeSuccess(game.gameId, event.data.candy, event.data.target, sl);
            }
            const ml = gsap.timeline();
            tl.add(ml, ">")
            const { results } = event.data;

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
                            () => playCollect(game.gameId, res, null),
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

            tl.play();

        },
        [playCollect, scenes, swipeSuccess, game, textures]
    );


    return { playApply };
};
export default useEvent



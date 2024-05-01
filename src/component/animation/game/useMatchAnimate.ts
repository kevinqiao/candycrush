import { CandySprite } from "component/pixi/CandySprite";
import { gsap } from "gsap";
import { CellItem } from "model/CellItem";
import { SCENE_NAME } from "model/Match3Constants";
import * as PIXI from "pixi.js";
import { MutableRefObject, useCallback, useRef } from "react";
import { useGameManager } from "service/GameManager";
import { useUserManager } from "service/UserManager";
import { GameScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import useCollectCandies from "../battle/useCollectCandies";
import useActAnimate from "./useActAnimate";
import useSkillAnimate from "./useSkillAnimate";


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
                                candy.asset = c.asset
                            }
                        },
                        x: cx,
                        y: cy,
                        duration: 0.3,
                        ease: 'power2.out',
                    }, "<")
            }
        })
    }
}
export const playMove = (toMove: CellItem[], gameScene: GameScene, textures: Texture[], tl: any) => {

    const candyMap = gameScene.candies;

    if (candyMap)
        toMove.forEach((c) => {
            const candy: CandySprite | undefined = candyMap.get(c.id);
            if (candy) {
                const cw = (candy as PIXI.Sprite).width;
                const ch = (candy as PIXI.Sprite).height;
                console.log(cw + ":" + ch + ":" + gameScene.gameId)
                const cx = c.column * cw + Math.floor(cw / 2);
                const cy = c.row * ch + Math.floor(ch / 2);
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

const buildSmesh = (candyMap: Map<number, CandySprite>, smesh: { target: number; candy: CellItem; smesh: CellItem[] }, tl: any) => {

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
    const smeshIds = smesh.smesh.map((s) => s.id);
    const cells: CandySprite[] = candies.filter((c) => smeshIds.includes(c.id));
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
                duration: 0.3,
                ease: 'power2.out',

            }, "<");

    })


}
export const playSmesh = (toSmesh: { target: number; candy: CellItem; smesh: CellItem[] }[][], gameScene: GameScene, tl: any) => {

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
const useMatchAnimate = (animateStatusRef: MutableRefObject<number>) => {
    const timelineRef = useRef<any>(null);
    const { game } = useGameManager();
    const { user } = useUserManager();
    const { scenes, textures } = useSceneManager();
    const { swipeSuccess } = useActAnimate();
    const { swapSuccess } = useSkillAnimate();
    const { playCollect } = useCollectCandies();

    const stopPlay = useCallback(() => {
        if (timelineRef.current)
            timelineRef.current.kill();
        timelineRef.current = null;
    }, [])
    const playApply = useCallback(
        (event: any) => {
            if (!game || !scenes?.get(SCENE_NAME.GAME_SCENES) || timelineRef.current) return;
            const gameScene: GameScene = scenes.get(SCENE_NAME.GAME_SCENES).find((g: GameScene) => g.gameId === game.gameId)
            console.log(gameScene.gameId + ":" + gameScene.cwidth)
            animateStatusRef.current = 3;
            const tl = gsap.timeline({
                onComplete: () => {
                    tl.kill();
                    timelineRef.current = null;
                    animateStatusRef.current = 0;
                }
            })
            timelineRef.current = tl;

            if (event.name === "cellSwapped" && game.uid !== user.uid) {
                const sl = gsap.timeline();
                tl.add(sl, "<")
                swipeSuccess(game.gameId, event.data.candy, event.data.target, sl);
            }
            if (event.name === "skillSwap" && game.uid !== user.uid) {
                const sl = gsap.timeline();
                tl.add(sl, "<")
                swapSuccess(game.gameId, event.data.candy, event.data.target, sl);
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
                                    const smeshs: { target: number; candy: CellItem; smesh: CellItem[] }[][] = res.toSmesh;
                                    smeshs.flat().forEach((c) => {
                                        c.smesh.forEach((c) => {
                                            const candy = candyMap.get(c.id);
                                            if (candy) {
                                                candyMap.delete(c.id)
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
                        console.log(res.toChange)
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


    return { playApply, stopPlay };
};
export default useMatchAnimate



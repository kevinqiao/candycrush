import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import { CellItem } from "../../model/CellItem";
import { SceneModel, useSceneManager } from "../../service/SceneManager";

const useCollectCandies = () => {
    const { scenes, textures } = useSceneManager();
    const playCollect = (gameId: string, cells: CellItem[], timeline: any) => {
      
        const gameScene: SceneModel | undefined = scenes.get(gameId);
        const battleScene: SceneModel | undefined = scenes.get("battle");
        const cwidth = gameScene?.cwidth;
        if (cells?.length > 0 && gameScene && battleScene && textures && cwidth) {

            cells.forEach((cell, index) => {
                const texture = textures?.find((d) => d.id === cell.asset);
                if (texture) {
                    const cl = gsap.timeline();
                    const sprite = new PIXI.Sprite(texture.texture);
                    sprite.anchor.set(0.5);
                    sprite.width = cwidth;
                    sprite.height = cwidth;
                    const x = gameScene.x + cell.column * cwidth + Math.floor(cwidth / 2);
                    const y = gameScene.y + cwidth * cell.row + Math.floor(cwidth / 2);
                    sprite.x = x;
                    sprite.y = y;
                    const controlPoint = { x: x + 20, y: y - cwidth + 40 }
                    battleScene.app.stage.addChild(sprite);
                    const target = { x: battleScene.x + 100, y: 100 }
                    cl.to(sprite, {
                        x: controlPoint.x,
                        y: controlPoint.y,
                        duration: 0.3,
                        ease: 'circ.out',
                    })

                    cl.to(sprite, {
                        x: target.x,
                        y: target.y,
                        duration: 0.9,
                        ease: 'circ.in',
                        // onUpdate: () => {
                        //     // 在动画的每一帧更新终点的缩放
                        //     const progress = timeline.progress(); // 获取动画进度
                        //     const endScale = 1.3 - progress; // 计算缩放因子
                        //     sprite.scale.set(endScale); // 应用缩放到终点
                        // },
                        // onComplete: () => {
                        //     sprite.destroy();
                        // },
                    }, ">").to(sprite.scale, { duration: 0.9, x: 0, y: 0, ease: 'circ.in' }, "<");
                    timeline.add(cl, "<")
                }
            })
        }
    }
    return { playCollect }


}
export default useCollectCandies
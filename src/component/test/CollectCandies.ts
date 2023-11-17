import { gsap } from "gsap";
import * as PIXI from "pixi.js";

const useCollectCandies = () => {

    const playCollect = (sprite: PIXI.Sprite) => {


        const timeline = gsap.timeline();
        const sx = sprite.x;
        const sy = sprite.y;
        const targetX = 100; // 目标 X 坐标
        const targetY = 100; // 目标 Y 坐标

        // 计算弧线运动的控制点
        const controlX = sprite.x + 100;
        // timeline.to(sprite, {
        //     duration: 0.3,
        //     x: 500,
        //     y: 200,
        // }, 0).to(sprite.scale, {
        //     duration: 0.3,
        //     x: 1.5,
        //     y: 1.5,
        // }, 0)
        const controlY = sprite.y - 250; // 调整此值以控制弧线弯曲度
        timeline.to(sprite, {
            duration: 0.4,
            motionPath: {
                // autoRotate: true,
                path: [{ x: sprite.x, y: sprite.y }, { x: controlX, y: controlY }], // 控制点运动路径
            },
            ease: 'circ.out',
            onUpdate: () => {
                // 在动画的每一帧更新控制点的缩放
                const progress = timeline.progress(); // 获取动画进度
                const controlScale = 1 + 0.5 * progress; // 计算缩放因子
                sprite.scale.set(controlScale); // 应用缩放到控制点
            },

        });


        timeline.to(sprite, {
            duration: 0.8,
            motionPath: {
                // autoRotate: true,
                path: [{ x: controlX, y: controlY }, { x: targetX, y: targetY }], // 终点运动路径，从控制点开始
            },
            ease: 'circ.in',
            onUpdate: () => {
                // 在动画的每一帧更新终点的缩放
                const progress = timeline.progress(); // 获取动画进度
                const endScale = 1.5 - 1.5 * progress; // 计算缩放因子
                sprite.scale.set(endScale); // 应用缩放到终点
            },
            onComplete: () => {
                console.log('动画完成');
                sprite.x = sx;
                sprite.y = sy;
                sprite.scale.set(1)
            },
        });
        timeline.play();


    }
    return { playCollect }


}
export default useCollectCandies
import * as PIXI from "pixi.js";
import { DisplayObject } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import candy_texture_defs from "../../model/candy_textures";
import useCoord from "../../service/CoordManager";

interface Props {
  width: number;
  height: number;
  pid?: string;
}

const TextureList: React.FC = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const [scene, setScene] = useState<PIXI.Application>();
  const [candyTextures, setCandyTextures] = useState<{ id: number; texture: PIXI.Texture }[]>([]);
  const { width, height } = useCoord();
  const app = useRef<PIXI.Application | null>(null);

  const createPiece = () => {
    const graphics = new PIXI.Graphics();

    // 底层阴影
    graphics.beginFill(0x000000, 0.5); // 半透明的黑色来模拟阴影
    graphics.drawEllipse(100, 100, 80, 50);
    graphics.endFill();

    // 主要椭圆形
    graphics.beginFill(0xff0000); // 你选择的颜色
    graphics.drawEllipse(100, 100, 80, 50);
    graphics.endFill();

    // 高光效果
    graphics.beginFill(0xffffff, 0.5); // 半透明的白色来模拟光亮的反射
    graphics.drawEllipse(100, 100, 80, 50);
    graphics.endFill();

    // 从图形创建纹理
    if (scene?.render) {
      // const texture = scene.renderer.generateTexture(graphics);
      // return texture;
      // 使用纹理创建精灵
      // const sprite = new PIXI.Sprite(texture);
      // return sprite;
    }
  };
  useEffect(() => {
    // Initialize PixiJS Application
    console.log(width + ":" + height);
    const scene = new PIXI.Application({
      width,
      height,
      backgroundAlpha: 0,
    });
    app.current = scene;
    if (sceneContainerRef.current && scene) {
      sceneContainerRef.current.appendChild(scene.view as HTMLCanvasElement);

      PIXI.Assets.load("/assets/assets_candy.png").then((tture: any) => {
        const frameSize = 100;
        const candy_textures = candy_texture_defs.map((c) => {
          const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
          const texture = new PIXI.Texture(tture.baseTexture, rect);
          return { id: c.id, texture };
        });

        setCandyTextures(candy_textures);
      });
    }

    return () => {
      if (sceneContainerRef.current && app.current) {
        // app.current.destroy(true, { children: true });
      }
    };
  }, []);

  useEffect(() => {
    let count = 0;
    if (app.current && candyTextures) {
      console.log("create sprite");
      // const piece = createPiece();
      // if (piece) {
      //   const sprite = new PIXI.Sprite(piece);
      //   sprite.anchor.set(0.5);
      //   sprite.x = 225;
      //   sprite.y = (Math.floor(count / 7) + 5) * 50 + 225;
      //   scene.stage.addChild(sprite as PIXI.DisplayObject);
      // }
      for (let texture of candyTextures) {
        const sprite = new PIXI.Sprite(texture.texture);
        sprite.anchor.set(0.5);
        sprite.width = 50;
        sprite.height = 50;
        sprite.x = (count % 7) * 50 + 25;
        sprite.y = Math.floor(count / 7) * 50 + 25;
        sprite.interactive = true;
        sprite.on("click", (event: any) => {
          console.log("click over on " + texture.id);
        });
        sprite.on("mousedown", (event: any) => {
          console.log("mouse over on " + texture.id);
        });
        app.current.stage.addChild(sprite as DisplayObject);
        count++;
      }
      // const texture28 = candyTextures.find((c) => c.id === 28);
      // if (texture28) {
      //   for (let i = 0; i < 7; i++) {
      //     const sprite = new PIXI.Sprite(texture28.texture);
      //     sprite.anchor.set(0.5);
      //     sprite.width = 50;
      //     sprite.height = 50;
      //     sprite.x = i * 50 + 25;
      //     sprite.y = (Math.floor(count / 7) + 1) * 50 + 25;
      //     sprite.interactive = true;
      //     sprite.on("click", (event: any) => {
      //       console.log("mouse over on " + texture28.id);
      //     });
      //     scene.stage.addChild(sprite as PIXI.DisplayObject);
      //   }
      // }
      // const texture29 = candyTextures.find((c) => c.id === 29);
      // if (texture29) {
      //   for (let i = 0; i < 7; i++) {
      //     const sprite = new PIXI.Sprite(texture29.texture);
      //     sprite.anchor.set(0.5);
      //     sprite.width = 50;
      //     sprite.height = 50;
      //     sprite.x = i * 50 + 25;
      //     sprite.y = (Math.floor(count / 7) + 2) * 50 + 25;
      //     scene.stage.addChild(sprite as PIXI.DisplayObject);
      //   }
      // }
      // const texture30 = candyTextures.find((c) => c.id === 30);
      // if (texture30) {
      //   for (let i = 0; i < 7; i++) {
      //     const sprite = new PIXI.Sprite(texture30.texture);
      //     sprite.anchor.set(0.5);
      //     sprite.width = 50;
      //     sprite.height = 50;
      //     sprite.x = i * 50 + 25;
      //     sprite.y = (Math.floor(count / 7) + 3) * 50 + 25;
      //     scene.stage.addChild(sprite as PIXI.DisplayObject);
      //   }
      // }
      // const texture31 = candyTextures.find((c) => c.id === 31);
      // if (texture31) {
      //   for (let i = 0; i < 7; i++) {
      //     const sprite = new PIXI.Sprite(texture31.texture);
      //     sprite.anchor.set(0.5);
      //     sprite.width = 50;
      //     sprite.height = 50;
      //     sprite.x = i * 50 + 25;
      //     sprite.y = (Math.floor(count / 7) + 4) * 50 + 25;
      //     scene.stage.addChild(sprite as PIXI.DisplayObject);
      //   }
      // }
    }
  }, [candyTextures]);

  return <div ref={sceneContainerRef} style={{ width, height }}></div>;
};

export default TextureList;

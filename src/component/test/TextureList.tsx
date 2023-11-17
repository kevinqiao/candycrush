import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [candy_textures, setCandyTextures] = useState<{ id: number; texture: PIXI.Texture }[]>([]);
  const { width, height } = useCoord();
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
    if (scene) {
      const texture = scene.renderer.generateTexture(graphics);
      return texture;
      // 使用纹理创建精灵
      // const sprite = new PIXI.Sprite(texture);
      // return sprite;
    }
  };
  useEffect(() => {
    // Initialize PixiJS Application
    console.log(width + ":" + height);
    const app = new PIXI.Application({
      width,
      height,
      transparent: true,
      backgroundAlpha: 0,
    } as any);

    if (sceneContainerRef.current) {
      sceneContainerRef.current.appendChild(app.view as unknown as Node);
      const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
      const frameSize = 100;
      const candy_textures = candy_texture_defs.map((c) => {
        const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
        const texture = new PIXI.Texture(baseTexture, rect);
        return { id: c.id, texture };
      });
      setCandyTextures(candy_textures);
    }
    setScene(app);
    return () => {
      app.destroy(true);
    };
  }, [width, height]);

  useEffect(() => {
    let count = 0;
    if (scene && candy_texture_defs) {
      for (let texture of candy_textures) {
        const sprite = new PIXI.Sprite(texture.texture);
        sprite.anchor.set(0.5);
        sprite.width = 50;
        sprite.height = 50;
        sprite.x = (count % 7) * 50 + 25;
        sprite.y = Math.floor(count / 7) * 50 + 25;
        scene.stage.addChild(sprite);
        count++;
      }
      const texture28 = candy_textures.find((c) => c.id === 28);
      if (texture28) {
        for (let i = 0; i < 7; i++) {
          const sprite = new PIXI.Sprite(texture28.texture);
          sprite.anchor.set(0.5);
          sprite.width = 50;
          sprite.height = 50;
          sprite.x = i * 50 + 25;
          sprite.y = (Math.floor(count / 7) + 1) * 50 + 25;
          scene.stage.addChild(sprite);
        }
      }
      const texture29 = candy_textures.find((c) => c.id === 29);
      if (texture29) {
        for (let i = 0; i < 7; i++) {
          const sprite = new PIXI.Sprite(texture29.texture);
          sprite.anchor.set(0.5);
          sprite.width = 50;
          sprite.height = 50;
          sprite.x = i * 50 + 25;
          sprite.y = (Math.floor(count / 7) + 2) * 50 + 25;
          scene.stage.addChild(sprite);
        }
      }
      const texture30 = candy_textures.find((c) => c.id === 30);
      if (texture30) {
        for (let i = 0; i < 7; i++) {
          const sprite = new PIXI.Sprite(texture30.texture);
          sprite.anchor.set(0.5);
          sprite.width = 50;
          sprite.height = 50;
          sprite.x = i * 50 + 25;
          sprite.y = (Math.floor(count / 7) + 3) * 50 + 25;
          scene.stage.addChild(sprite);
        }
      }
      const texture31 = candy_textures.find((c) => c.id === 31);
      if (texture31) {
        for (let i = 0; i < 7; i++) {
          const sprite = new PIXI.Sprite(texture31.texture);
          sprite.anchor.set(0.5);
          sprite.width = 50;
          sprite.height = 50;
          sprite.x = i * 50 + 25;
          sprite.y = (Math.floor(count / 7) + 4) * 50 + 25;
          scene.stage.addChild(sprite);
        }
      }
      const piece = createPiece();
      if (piece) {
        const sprite = new PIXI.Sprite(piece);
        sprite.anchor.set(0.5);
        sprite.x = 225;
        sprite.y = (Math.floor(count / 7) + 5) * 50 + 225;
        scene.stage.addChild(sprite);
      }
    }
  }, [candy_textures, scene]);
  const render = useMemo(() => {
    return <div ref={sceneContainerRef} style={{ width, height }}></div>;
  }, []);
  return <>{render}</>;
  // return <div ref={sceneContainerRef} style={{ width, height }}></div>;
};

export default TextureList;

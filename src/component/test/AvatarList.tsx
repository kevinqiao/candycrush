import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import useCoord from "../../service/CoordManager";
import { Avatar } from "../pixi/Avatar";
import { ARRAY_TYPE, AvatarBar } from "../pixi/AvatarBar";
import { CandySprite } from "../pixi/CandySprite";

interface Props {
  width: number;
  height: number;
  pid?: string;
}

const AvatarList: React.FC = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const [scene, setScene] = useState<PIXI.Application>();
  const [textures, setTextures] = useState<PIXI.Texture[]>([]);
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
      const baseTexture = PIXI.BaseTexture.from("assets/avatar.png");
      const frameWidth = 185;
      const frameHeight = 185;
      const textureList = [];
      let count = 1;
      for (let r = 0; r < 1; r++) {
        const y = r * frameHeight + 100;
        for (let c = 0; c < 2; c++) {
          const x = c * frameWidth + 35;
          const rect = new PIXI.Rectangle(x, y, frameWidth, frameHeight);
          const texture = new PIXI.Texture(baseTexture, rect);
          textureList.push(texture);
        }
        setTextures(textureList);
      }
    }
    setScene(app);
    return () => {
      app.destroy(true);
    };
  }, [width, height]);

  useEffect(() => {
    let count = 0;
    if (scene) {
      for (let texture of textures) {
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.width = 50;
        sprite.height = 50;
        sprite.x = (count % 7) * 50 + 25;
        sprite.y = Math.floor(count / 7) * 50 + 25;
        scene.stage.addChild(sprite);
        count++;
      }
      const candy = new CandySprite(textures[0], 1, 160, 60);
      candy.x = 200;
      candy.y = 600;
      candy.width = 50;
      candy.height = 50;
      scene.stage.addChild(candy);

      const avatar = new AvatarBar(textures[0], "500", 160, 60, ARRAY_TYPE.HORIZATION_LEFT);
      avatar.x = 500;
      avatar.y = 500;
      scene.stage.addChild(avatar);

      const opponent = new AvatarBar(textures[0], "500", 160, 60, ARRAY_TYPE.HORIZATION_RIGHT);
      // opponent.setArrayType(ARRAY_TYPE.HORIZATION_RIGHT);
      opponent.x = 660;
      opponent.y = 500;
      scene.stage.addChild(opponent);

      const profile = new Avatar(textures[0], "Kevin Qiao", 60, 80);
      profile.x = 200;
      profile.y = 250;
      scene.stage.addChild(profile);
      const textStyle = new PIXI.TextStyle({
        fontSize: 14,
        fill: 0xff0000, // Use 0x0000ff to specify blue color
      });
      profile.changeTxTStyle(textStyle);

      // const text = new PIXI.Text("Blue Text", textStyle);

      // // Position the text (optional)
      // text.x = width - text.width;
      // text.y = 300;

      // scene.stage.addChild(text);
    }
  }, [textures, scene]);
  const render = useMemo(() => {
    return <div ref={sceneContainerRef} style={{ width, height }}></div>;
  }, []);
  return <>{render}</>;
  // return <div ref={sceneContainerRef} style={{ width, height }}></div>;
};

export default AvatarList;

import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import useCoord from "../../service/CoordManager";

interface Props {
  width: number;
  height: number;
  pid?: string;
}
gsap.registerPlugin(MotionPathPlugin);
const TexturePlay: React.FC = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const [scene, setScene] = useState<PIXI.Application>();
  const pieceRefs = useRef<PIXI.Sprite[]>([]);
  const [candy_textures, setCandyTextures] = useState<{ id: number; texture: PIXI.Texture }[]>([]);
  const { width, height } = useCoord();
  function createPieces(app: PIXI.Application, sprite: PIXI.Sprite, numberOfPieces: number): PIXI.Sprite[] {
    if (!app) return [];
    const ellipseMask = new PIXI.Graphics();

    ellipseMask.beginFill(0xffffff);
    ellipseMask.drawCircle(sprite.width / 2, sprite.height / 2, 70);
    ellipseMask.endFill();
    const newSprite = new PIXI.Sprite(sprite.texture);
    newSprite.x = 550;
    newSprite.y = 250;

    newSprite.mask = ellipseMask; // 应用遮罩
    app.stage.addChild(newSprite);
    // 生成新纹理
    const pieceTexture = app.renderer.generateTexture(newSprite);
    // const pieceTexture = app.renderer.generateTexture(newSprite, {
    //   scaleMode: PIXI.SCALE_MODES.LINEAR,
    //   resolution: window.devicePixelRatio,
    //   region: new PIXI.Rectangle(14, 12, 42, 52),
    // });
    newSprite.mask = null;
    newSprite.alpha = 1;
    const pieces: PIXI.Sprite[] = [];
    // piece.x = sprite.x;
    // piece.y = sprite.y;
    // app.stage.addChild(piece);
    // pieces.push(piece);
    for (let i = 0; i < numberOfPieces; i++) {
      // 创建碎片Sprite，这里需要你自己的逻辑来定义如何裁剪纹理
      const piece: PIXI.Sprite = new PIXI.Sprite(pieceTexture);
      piece.anchor.set(0.5);
      piece.alpha = 1;
      // 设置碎片的位置等于原始Sprite的位置
      piece.x = sprite.x;
      piece.y = sprite.y;

      piece.width = 18 + 6 * Math.random();
      piece.height = piece.width;

      app.stage.addChild(piece);
      // 存储碎片以便后续使用
      pieces.push(piece);
    }
    return pieces;
  }
  function explodePieces(target: PIXI.Sprite): void {
    const pieces: PIXI.Sprite[] = pieceRefs.current;
    const tl = gsap.timeline();
    pieces.forEach((piece: PIXI.Sprite) => {
      piece.x = target.x;
      piece.y = target.y;
      piece.alpha = 1;
      const x: number = 10 + (0.5 - Math.random()) * 150;
      const y: number = 15 + (0.5 - Math.random()) * 150;
      tl.to(
        piece,
        {
          x: piece.x + x,
          y: piece.y + y,
          alpha: 0,
          rotation: Math.random() * Math.PI, // 旋转角度为弧度
          duration: 2,
          ease: "power2.out",
        },
        0
      );
    });
    tl.play();
  }
  useEffect(() => {
    // Initialize PixiJS Application

    const app = new PIXI.Application({
      width,
      height,
      transparent: true,
      backgroundAlpha: 0,
    } as any);

    if (sceneContainerRef.current) {
      sceneContainerRef.current.appendChild(app.view as unknown as Node);
      const baseTexture = PIXI.BaseTexture.from("assets/match3.png");
      baseTexture.on("update", () => {
        const frameSize = 70;
        const x = 260;
        const y = 870;
        const rect = new PIXI.Rectangle(x, y, frameSize, frameSize + 5);
        const texture = new PIXI.Texture(baseTexture, rect);
        const sprite = new PIXI.Sprite(texture);
        sprite.interactive = true;

        // Add an event listener for the pointerdown event
        sprite.anchor.set(0.5);
        sprite.x = 225;
        sprite.y = 225;

        const pieces = createPieces(app, sprite, 4);
        // console.log(pieces.length);
        pieceRefs.current = pieces;
        // pieceRefs.current.push(...createPieces(app, sprite, 10));
        sprite.on("pointerdown", (event: PointerEvent) => {
          const cell: PIXI.Sprite = event.target as PIXI.Sprite;
          console.log(cell.width + ":" + cell.height);
          playCollect(cell);
          // explodePieces(cell);
        });
        app.stage.addChild(sprite);
      });
    }
    setScene(app);
    return () => {
      app.destroy(true);
    };
  }, [width, height]);
  const playCollect = (sprite: PIXI.Sprite) => {
    const tl = gsap.timeline(); // Set ease for the entire timeline
    const x = sprite.x;
    const y = sprite.y;
    console.log(x + ":" + y);
    // tl.to(sprite, {
    //   duration: 1,
    //   motionPath: {
    //     path: [{ x: 500, y: 300 }],
    //   },
    // }).to(sprite.scale, { x: 1.2, y: 1.2, duration: 3 });
    // gsap.to(sprite, {
    //   duration: 1,
    //   motionPath: {
    //     path: [{ x: 500, y: 300 }],
    //   },
    //   scale: 1.2,
    // });
    tl.to(sprite, {
      duration: 1,
      motionPath: {
        path: [{ x: x + 200, y: y + 300 }],
      },
    })
      .to(sprite, {
        duration: 1,
        motionPath: {
          path: [{ x: x + 300, y: y + 100 }],
        },
        scale: 0,
      })
      .to(sprite.scale, { x: 1.2, y: 1.2, duration: 3 });
    tl.play();
  };
  const render = useMemo(() => {
    return <div ref={sceneContainerRef} style={{ width, height }}></div>;
  }, []);
  return <>{render}</>;
  // return <div ref={sceneContainerRef} style={{ width, height }}></div>;
};

export default TexturePlay;

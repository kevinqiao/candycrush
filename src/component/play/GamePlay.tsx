import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import candy_texture_defs from "../../model/candy_textures";
import useSceneManager from "../../service/SceneManager";
import useDimension from "../../util/useDimension";

const GamePlay: React.FC = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const [scene, setScene] = useState<PIXI.Application>();
  const [candy_textures, setCandyTextures] = useState<{ id: number; texture: PIXI.Texture }[]>();

  useSceneManager(scene, candy_textures);
  const { width, height } = useDimension(sceneContainerRef);

  useEffect(() => {
    // Initialize PixiJS Application

    let app: PIXI.Application;
    // (app.view as any).style.pointerEvents = 'none';
    if (sceneContainerRef.current && height > 0 && width > 0) {
      app = new PIXI.Application({
        width: width,
        height: height,
        backgroundAlpha: 0,
      } as any);
      sceneContainerRef.current.appendChild(app.view as unknown as Node);
      const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
      const frameSize = 100;
      const candy_textures = candy_texture_defs.map((c) => {
        const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
        const texture = new PIXI.Texture(baseTexture, rect);
        return { id: c.id, texture };
      });
      setCandyTextures(candy_textures);
      setScene(app);
    }

    return () => {
      if (app) app.destroy(true);
    };
  }, [width, height]);
  const render = useMemo(() => {
    return (
      <div
        ref={sceneContainerRef}
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
          border: 0,
          backgroundColor: "transparent",
        }}
      ></div>
    );
  }, []);
  return <>{render}</>;
};

export default GamePlay;

import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { CandyModel } from "../../model/CandyModel";
import { COLUMN } from "../../model/Constants";
import { SceneModel, useSceneManager } from "../../service/SceneManager";
import useDimension from "../../util/useDimension";
import useGameViewModel from "./GameViewModel";
interface Props {
  gameId: string;
  top: number;
  left: number;
}
const GamePlay: React.FC<Props> = ({ gameId, top, left }) => {
  const [gameScene, setGameScene] = useState<SceneModel>();
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { scenes } = useSceneManager();
  const { width, height } = useDimension(sceneContainerRef);

  // const [scene, setScene] = useState<PIXI.Application>();
  // const [candy_textures, setCandyTextures] = useState<{ id: number; texture: PIXI.Texture }[]>();

  useGameViewModel(gameScene);
  useEffect(() => {
    if (sceneContainerRef.current && gameId) {
      const scene = scenes.get(gameId);
      if (!scene && width > 0 && height > 0) {
        const scene = {
          app: new PIXI.Application({
            width: width,
            height: height,
            backgroundAlpha: 0,
          }),
          x: left,
          y: top,
          width: width,
          height: height,
          cwidth: Math.floor(width / COLUMN),
          cheight: Math.floor(width / COLUMN),
          candies: new Map<number, CandyModel>(),
        };
        scenes.set(gameId, scene);
        setGameScene(scene);
        sceneContainerRef.current.appendChild(scene.app.view as unknown as Node);
      }
    }
  }, [scenes, gameId, width, height]);
  // const { width, height } = useDimension(sceneContainerRef);

  // useEffect(() => {
  //   let app: PIXI.Application;
  //   // (app.view as any).style.pointerEvents = 'none';
  //   if (sceneContainerRef.current && height > 0 && width > 0) {
  //     app = new PIXI.Application({
  //       width: width,
  //       height: height,
  //       backgroundAlpha: 0,
  //     } as any);
  //     sceneContainerRef.current.appendChild(app.view as unknown as Node);
  //     const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
  //     const frameSize = 100;
  //     const candy_textures = candy_texture_defs.map((c) => {
  //       const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
  //       const texture = new PIXI.Texture(baseTexture, rect);
  //       return { id: c.id, texture };
  //     });
  //     setCandyTextures(candy_textures);
  //     setScene(app);
  //   }

  //   return () => {
  //     if (app) app.destroy(true);
  //   };
  // }, [width, height]);

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

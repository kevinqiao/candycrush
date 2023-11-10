import * as PIXI from "pixi.js";
import React, { createContext, useContext, useEffect, useState } from "react";
import candy_texture_defs from "../model/candy_textures";
import { useBattleManager } from "./BattleManager";
export interface SceneModel {
  app: PIXI.Application;
  x: number;
  y: number;
  width: number;
  height: number;
  textures: { id: number; texture: PIXI.Texture }[];
}
interface ISceneContext {
  consoleScene: SceneModel | null;
  gameScenes: Map<string, SceneModel>;
  animateScene: SceneModel | null;
}
const SceneContext = createContext<ISceneContext>({
  consoleScene: null,
  gameScenes: new Map(),
  animateScene: null,
});

export const SceneProvider = ({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) => {
  const { battle } = useBattleManager();
  const [textures, setTextures] = useState<{ id: number; texture: PIXI.Texture }[] | null>(null);
  const [consoleScene, setConsoleScene] = useState<SceneModel | null>(null);
  const [gameScenes, setGameScenes] = useState<Map<string, SceneModel>>(new Map());
  const [animateScene, setAnimateScene] = useState<SceneModel | null>(null);

  useEffect(() => {
    if (width > 0 && height > 0 && battle?.games && battle.games.length > 0 && textures) {
      const gameScene = {
        app: new PIXI.Application({
          width: width * 0.8,
          height: height * 0.6,
          backgroundAlpha: 0,
        }),
        x: 50,
        y: height * 0.35,
        width: width * 0.8,
        height: height * 0.6,
        textures,
      };
      gameScenes.set(battle.games[0].gameId, gameScene);
      setConsoleScene({
        app: new PIXI.Application({
          width: width * 0.7,
          height: height * 0.3,
          backgroundColor: "white",
        }),
        x: 50,
        y: 10,
        width: width * 0.7,
        height: height * 0.3,
        textures,
      });
      setAnimateScene({
        app: new PIXI.Application({
          width,
          height,
          backgroundAlpha: 0,
        }),
        x: 0,
        y: 0,
        width,
        height,
        textures,
      });
    }
  }, [battle, textures, gameScenes]);

  useEffect(() => {
    if (width > 0 && height > 0 && gameScenes?.size > 0)
      Array.from(gameScenes.values()).forEach((s) => {
        s.app.renderer.resize(width * 0.8, height * 0.6);
      });
  }, [width, height, gameScenes]);

  useEffect(() => {
    const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
    const frameSize = 100;
    const candy_textures = candy_texture_defs.map((c) => {
      const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
      const texture = new PIXI.Texture(baseTexture, rect);
      return { id: c.id, texture };
    });
    setTextures(candy_textures);
  }, []);
  const value = {
    consoleScene,
    gameScenes,
    animateScene,
  };

  return <SceneContext.Provider value={value}> {children} </SceneContext.Provider>;
};

export const useSceneManager = () => {
  return useContext(SceneContext);
};

export default SceneProvider;

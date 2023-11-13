import * as PIXI from "pixi.js";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { CandyModel } from "../model/CandyModel";
export interface SceneModel {
  app: PIXI.Application;
  x: number;
  y: number;
  width: number;
  height: number;
  cwidth?: number;
  cheight?: number;
  textures?: { id: number; texture: PIXI.Texture }[];
  candies?: Map<number, CandyModel>;
}
interface ISceneContext {
  textures: { id: number; texture: PIXI.Texture }[];
  scenes: Map<string, SceneModel>;
}
const SceneContext = createContext<ISceneContext>({
  textures: [],
  scenes: new Map(),
});

export const SceneProvider = ({ children }: { children: React.ReactNode }) => {
  const scenesRef = useRef<Map<string, SceneModel>>(new Map());
  const texturesRef = useRef<{ id: number; texture: PIXI.Texture }[]>([]);

  useEffect(() => {
    return () => {
      Array.from(scenesRef.current.values()).forEach((scene) => scene.app.destroy(true));
    };
  }, []);
  // useEffect(() => {
  //   if (width > 0 && height > 0)
  //     Array.from(gameScenesRef.current.values()).forEach((s) => {
  //       s.app.renderer.resize(width * 0.8, height * 0.6);
  //     });
  // }, [width, height]);

  const value = {
    textures: texturesRef.current,
    scenes: scenesRef.current,
  };

  return <SceneContext.Provider value={value}> {children} </SceneContext.Provider>;
};

export const useSceneManager = () => {
  return useContext(SceneContext);
};

export default SceneProvider;

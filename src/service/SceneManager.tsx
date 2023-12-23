import * as PIXI from "pixi.js";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import PageProps, { PagePosition } from "../model/PageProps";
import { GameScene, SceneModel } from "../model/SceneModel";
import candy_texture_defs from "../model/candy_textures";
interface ISceneContext {
  containerBound: PagePosition | null;
  textures: { id: number; texture: PIXI.Texture }[];
  avatarTextures: { name: string; texture: PIXI.Texture }[];
  scenes: Map<string, SceneModel>;
  sceneEvent: SceneEvent | null;
  updateScene: (name: string, data: any) => void;
  stageScene: (id: string, scene: SceneModel | null) => void;
  checkLoad: (names: string[]) => boolean;
  disableCloseBtn: () => void;
  exit: () => void;
}
const SceneContext = createContext<ISceneContext>({
  containerBound: null,
  textures: [],
  avatarTextures: [],
  scenes: new Map(),
  sceneEvent: null,

  updateScene: (name: string, data: any) => null,
  stageScene: (id: string, scene: SceneModel | null) => null,
  checkLoad: (names: string[]) => false,
  disableCloseBtn: () => null,
  exit: () => null,
});
interface SceneEvent {
  name: string;
  type: number;
}
const SCENE_EVENT_TYPE = {
  CREATE: 0,
  UPDATE: 1,
  REMOVE: 2,
};

export const SceneProvider = ({ pageProp, children }: { pageProp: PageProps; children: React.ReactNode }) => {
  const scenesRef = useRef<Map<string, SceneModel>>(new Map());
  const texturesRef = useRef<{ id: number; texture: PIXI.Texture }[]>([]);
  const avatarTexturesRef = useRef<{ name: string; texture: PIXI.Texture }[]>([]);
  const [sceneEvent, setSceneEvent] = useState<SceneEvent | null>(null);

  const loadAvatarTextures = () => {
    const baseTexture = PIXI.BaseTexture.from("assets/avatar.png");
    const frameWidth = 185;
    const frameHeight = 185;
    let count = 1;
    for (let r = 0; r < 1; r++) {
      const y = r * frameHeight + 100;
      for (let c = 0; c < 2; c++) {
        const x = c * frameWidth + 35;
        const rect = new PIXI.Rectangle(x, y, frameWidth, frameHeight);
        const texture = new PIXI.Texture(baseTexture, rect);
        avatarTexturesRef.current.push({ name: "A" + count, texture: texture });
        count++;
      }
    }
  };
  const loadCandyTextures = () => {
    const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
    const frameSize = 100;
    const all = candy_texture_defs.map((c) => {
      const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
      const texture = new PIXI.Texture(baseTexture, rect);
      return { id: c.id, texture };
    });
    texturesRef.current.push(...all);
  };
  useEffect(() => {
    loadCandyTextures();
    loadAvatarTextures();
    return () => {
      for (let scene of scenesRef.current.values()) {
        if (scene && !scene.type) {
          const gameScene = scene as GameScene;
          if (gameScene.candies) {
            Array.from(gameScene.candies.values()).forEach((c) => c.destroy(true));
          }
          (scene.app as PIXI.Application).destroy(true);
        }
      }
    };
  }, []);

  const value = {
    containerBound: pageProp.position,
    textures: texturesRef.current,
    avatarTextures: avatarTexturesRef.current,
    scenes: scenesRef.current,
    sceneEvent,
    exit: useCallback(() => {
      if (pageProp.exit) pageProp.exit();
    }, [pageProp]),
    disableCloseBtn: useCallback(() => {
      if (pageProp.disableCloseBtn) {
        console.log("call disable close");
        pageProp.disableCloseBtn();
      }
    }, [pageProp]),
    updateScene: useCallback((name: string, data: any) => {
      const scene = scenesRef.current.get(name);
      if (scene) {
        if (data) Object.assign(scene, data);
        //  setSceneEvent({ name, type: SCENE_EVENT_TYPE.UPDATE });
      }
    }, []),

    stageScene: useCallback((id: string, scene: SceneModel | null) => {
      if (scene && !scenesRef.current.get(id)) {
        scenesRef.current.set(id, scene);
        setSceneEvent({ name: id, type: SCENE_EVENT_TYPE.CREATE });
      }
    }, []),
    checkLoad: useCallback((names: string[]) => {
      return names.every((name) => Array.from(scenesRef.current.keys()).includes(name));
    }, []),
  };

  return <SceneContext.Provider value={value}> {children} </SceneContext.Provider>;
};
export const useSceneManager = () => {
  return useContext(SceneContext);
};
export default SceneProvider;

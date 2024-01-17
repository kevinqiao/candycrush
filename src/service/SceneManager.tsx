import candy_textures from "model/candy_textures";
import * as PIXI from "pixi.js";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import PageProps, { PagePosition } from "../model/PageProps";
import { SceneModel } from "../model/SceneModel";
interface ISceneContext {
  containerBound: PagePosition | null | undefined;
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

export const SceneProvider = ({
  pageProp,
  pagePosition,
  children,
}: {
  pageProp: PageProps;
  pagePosition: PagePosition;
  children: React.ReactNode;
}) => {
  const scenesRef = useRef<Map<string, SceneModel>>(new Map());
  const texturesRef = useRef<{ id: number; texture: PIXI.Texture }[]>([]);
  const avatarTexturesRef = useRef<{ name: string; texture: PIXI.Texture }[]>([]);
  const [sceneEvent, setSceneEvent] = useState<SceneEvent | null>(null);
  const [containerBound, setContainerBound] = useState<PagePosition | undefined>();
  const [complete, setComplete] = useState(false);

  const loadAvatarTextures = () => {
    // const baseTexture = PIXI.BaseTexture.from("assets/avatar.png");
    PIXI.Assets.load("../assets/avatar.png").then((tture: any) => {
      const frameWidth = 185;
      const frameHeight = 185;
      let count = 1;
      for (let r = 0; r < 1; r++) {
        const y = r * frameHeight + 100;
        for (let c = 0; c < 2; c++) {
          const x = c * frameWidth + 35;
          const rect = new PIXI.Rectangle(x, y, frameWidth, frameHeight);
          // const texture = new PIXI.Texture(baseTexture, rect);
          const texture = new PIXI.Texture(tture.texture.baseTexture, rect);
          avatarTexturesRef.current.push({ name: "A" + count, texture: texture });
          count++;
        }
      }
    });
  };

  const loadCandyTextures = () => {
    PIXI.Assets.load("/assets/assets_candy.png").then((tture: any) => {
      // loader.add("candyTextures", "../assets/assets_candy.png");
      // loader.load((loader, resources) => {
      const frameSize = 100;
      // const candyTextures = resources.candyTextures;
      if (tture) {
        const all = candy_textures.map((c) => {
          const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
          const texture = new PIXI.Texture(tture.baseTexture, rect);
          return { id: c.id, texture };
        });
        texturesRef.current.push(...all);
        setComplete(true);
      }

      // 资源加载完成后的操作
    });
    // const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
    // baseTexture.on("update", () => {
    //   const frameSize = 100;
    //   const all = candy_texture_defs.map((c) => {
    //     const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
    //     const texture = new PIXI.Texture(baseTexture, rect);
    //     return { id: c.id, texture };
    //   });
    //   texturesRef.current.push(...all);
    //   setComplete(true);
    // });
  };
  useEffect(() => {
    if (pagePosition) {
      setContainerBound(pagePosition);
    }
  }, [pagePosition]);
  useEffect(() => {
    loadCandyTextures();
    // loadAvatarTextures();
    return () => {
      for (let scene of scenesRef.current.values()) {
        if (scene && !scene.type) {
          // const gameScene = scene as GameScene;
          // if (gameScene.candies) {
          //   Array.from(gameScene.candies.values()).forEach((c) => c.destroy(true));
          // }
          (scene.app as PIXI.Application).destroy(true);
        }
      }
    };
  }, []);

  const value = {
    containerBound,
    textures: texturesRef.current,
    avatarTextures: avatarTexturesRef.current,
    scenes: scenesRef.current,
    sceneEvent,
    exit: useCallback(() => {
      if (pageProp.close) pageProp.close(0);
    }, [pageProp]),
    disableCloseBtn: useCallback(() => {
      if (pageProp.disableCloseBtn) {
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

  return <>{complete ? <SceneContext.Provider value={value}> {children} </SceneContext.Provider> : null}</>;
};
export const useSceneManager = () => {
  return useContext(SceneContext);
};
export default SceneProvider;

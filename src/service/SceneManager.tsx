import { SCENE_NAME } from "model/Constants";
import candy_textures from "model/candy_textures";
import * as PIXI from "pixi.js";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { loadSvgAsTexture } from "util/Utils";
import PageProps, { PagePosition } from "../model/PageProps";
import { SceneModel } from "../model/SceneModel";
interface ISceneContext {
  load: number; //0-play 1-replay;
  containerBound: PagePosition | null | undefined;
  textures: { id: number; texture: PIXI.Texture }[];
  avatarTextures: { name: string; texture: PIXI.Texture }[];
  iconTextures: { name: string; texture: PIXI.Texture }[];
  scenes: Map<string, any>;
  sceneEvent: SceneEvent | null;
  stageScene: (id: string, scene: SceneModel | null) => void;
  disableCloseBtn: () => void;
  exit: () => void;
}
const SceneContext = createContext<ISceneContext>({
  load: 0,
  containerBound: null,
  textures: [],
  avatarTextures: [],
  iconTextures: [],
  scenes: new Map(),
  sceneEvent: null,

  stageScene: (id: string, scene: any) => null,

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
  load,
  pageProp,
  pagePosition,
  children,
}: {
  load: number;
  pageProp: PageProps;
  pagePosition: PagePosition;
  children: React.ReactNode;
}) => {
  const scenesRef = useRef<Map<string, any>>(new Map());
  const texturesRef = useRef<{ id: number; texture: PIXI.Texture }[]>([]);
  const avatarTexturesRef = useRef<{ name: string; texture: PIXI.Texture }[]>([]);
  const iconTexturesRef = useRef<{ name: string; texture: PIXI.Texture }[]>([]);
  const [sceneEvent, setSceneEvent] = useState<SceneEvent | null>(null);
  // const [containerBound, setContainerBound] = useState<PagePosition | undefined>();
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    scenesRef.current.set(SCENE_NAME.BATTLE_CONSOLE, {});
    const loadTextures = async () => {
      const frameSize = 100;
      const tture = await PIXI.Assets.load("/assets/assets_candy.png");
      const all = candy_textures.map((c) => {
        const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
        const texture = new PIXI.Texture(tture.baseTexture, rect);
        return { id: c.id, texture };
      });
      texturesRef.current.push(...all);
      setComplete(true);
    };
    loadTextures();
    loadSvgAsTexture("/icons/focus-select-svgrepo-com.svg", (texture: PIXI.Texture) => {
      iconTexturesRef.current.push({ name: "focus", texture });
    });
    return () => {
      for (const scene of scenesRef.current.values()) {
        if (scene?.app && !scene.type) {
          (scene.app as PIXI.Application).destroy(true);
        }
      }
    };
  }, []);

  const value = {
    load,
    containerBound: pagePosition,
    textures: texturesRef.current,
    avatarTextures: avatarTexturesRef.current,
    iconTextures: iconTexturesRef.current,
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

    stageScene: useCallback((id: string, scene: SceneModel | null) => {
      if (scene) {
        const pscene = scenesRef.current.get(id);
        if (pscene) {
          Object.assign(pscene, scene);
        } else scenesRef.current.set(id, scene);
        setSceneEvent({ name: id, type: SCENE_EVENT_TYPE.CREATE });
      }
    }, []),
  };

  return <>{complete ? <SceneContext.Provider value={value}> {children} </SceneContext.Provider> : null}</>;
};
export const useSceneManager = () => {
  return useContext(SceneContext);
};
export default SceneProvider;

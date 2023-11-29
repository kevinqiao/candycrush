import * as PIXI from "pixi.js";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CandySprite } from "../component/pixi/CandySprite";
import { SCENE_NAME } from "../model/Constants";
import candy_texture_defs from "../model/candy_textures";
import { useBattleManager } from "./BattleManager";
export interface SceneModel {
  container?: HTMLDivElement;
  app: PIXI.Application | HTMLDivElement;
  type?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cwidth?: number;
  cheight?: number;
  column?: number;
  row?: number;
  textures?: { id: number; texture: PIXI.Texture }[];
  // candies?: Map<number, CandyModel>;
  candies?: Map<number, CandySprite>;
}
interface ISceneContext {
  textures: { id: number; texture: PIXI.Texture }[];
  avatarTextures: { name: string; texture: PIXI.Texture }[];
  scenes: Map<string, SceneModel>;
  scenesUpdated: string[] | null;
  scenesStaged: string[];
  stageScene: (id: string, container: HTMLDivElement) => void;
}
const SceneContext = createContext<ISceneContext>({
  textures: [],
  avatarTextures: [],
  scenes: new Map(),
  scenesUpdated: null,
  scenesStaged: [],
  stageScene: (id: string, container: HTMLDivElement) => null,
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
  const scenesRef = useRef<Map<string, SceneModel>>(new Map());
  const texturesRef = useRef<{ id: number; texture: PIXI.Texture }[]>([]);
  const avatarTexturesRef = useRef<{ name: string; texture: PIXI.Texture }[]>([]);
  const [scenesUpdated, setScenesUpdated] = useState<string[] | null>(null);
  const [scenesStaged, setScenesStaged] = useState<string[]>([]);
  const { battle } = useBattleManager();

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
      for (let name of scenesRef.current.keys()) {
        const scene = scenesRef.current.get(name);
        if (scene && !scene.type) {
          (scene.app as PIXI.Application).destroy(true);
          scene.candies?.forEach((c) => c.destroy(true));
        }
      }
    };
  }, []);
  useEffect(() => {
    if (battle?.games && battle.games.length > 0 && width > 0 && height > 0) {
      const consoleScene = {
        app: new PIXI.Application({
          width: width * 0.5,
          height: height * 0.2,
          backgroundAlpha: 0,
        }),
        x: 100,
        y: 20,
        width: width * 0.5,
        height: height * 0.2,
        candies: new Map<number, CandySprite>(),
      };
      scenesRef.current.set(SCENE_NAME.BATTLE_CONSOLE, consoleScene);
      const gameScene = {
        app: new PIXI.Application({
          width: width,
          height: height,
          backgroundAlpha: 0,
        }),
        y: height * 0.35,
        x: width * 0.15,
        width: width * 0.7,
        height: height * 0.6,
        column: battle.column,
        row: battle.row,
        cwidth: Math.floor((width * 0.7) / battle.column),
        cheight: Math.floor((width * 0.7) / battle.column),
        candies: new Map<number, CandySprite>(),
      };
      scenesRef.current.set(battle.games[0].gameId, gameScene);
      const battleScene = {
        app: new PIXI.Application({
          width: width,
          height: height,
          backgroundAlpha: 0,
        }),
        x: 0,
        y: 0,
        width: width,
        height: height,
        candies: new Map<number, CandySprite>(),
      };
      scenesRef.current.set(SCENE_NAME.BATTLE_HOME, battleScene);
      setScenesUpdated([SCENE_NAME.BATTLE_CONSOLE, SCENE_NAME.BATTLE_HOME, battle.games[0].gameId]);
    }
  }, [battle, width, height]);

  const value = {
    textures: texturesRef.current,
    avatarTextures: avatarTexturesRef.current,
    scenes: scenesRef.current,
    scenesUpdated,
    scenesStaged,
    stageScene: useCallback((id: string, container: HTMLDivElement) => {
      const scene = scenesRef.current.get(id);
      if (scene && !scene.container) {
        scene.container = container;
        setScenesStaged((prev) => [...prev, id]);
      }
    }, []),
  };

  return <SceneContext.Provider value={value}> {children} </SceneContext.Provider>;
};

export const useSceneManager = () => {
  return useContext(SceneContext);
};

export default SceneProvider;

import { CandySprite } from "component/pixi/CandySprite";
import { BattleModel } from "model/Battle";
import candy_textures from "model/candy_textures";
import { BATTLE_LOAD } from "model/Constants";
import { SCENE_NAME } from "model/Match3Constants";
import * as PIXI from "pixi.js";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getGameBound, getGameConsoleBound } from "util/BattleBoundUtil";
import { loadSvgAsTexture } from "util/Utils";
import PageProps, { PagePosition } from "../model/PageProps";
import { GameConsoleScene, GameScene, SceneModel } from "../model/SceneModel";
import { useUserManager } from "./UserManager";
interface ISceneContext {
  load: number; //0-play 1-replay;
  visible: boolean;
  containerBound: PagePosition | null | undefined;
  textures: { id: number; texture: PIXI.Texture }[];
  avatarTextures: { name: string; texture: PIXI.Texture }[];
  iconTextures: { name: string; texture: PIXI.Texture }[];
  scenes: Map<string, any> | null;
  sceneEvent: SceneEvent | null;
  stageScene: (id: string, scene: SceneModel | null) => void;
  initialize: (battle: BattleModel) => void;
  disableCloseBtn: () => void;
  exit: () => void;
}
const SceneContext = createContext<ISceneContext>({
  load: 0,
  visible: true,
  containerBound: null,
  textures: [],
  avatarTextures: [],
  iconTextures: [],
  scenes: null,
  sceneEvent: null,

  stageScene: (id: string, scene: any) => null,
  initialize: (battle: BattleModel) => null,
  disableCloseBtn: () => null,
  exit: () => null,
});
interface SceneEvent {
  name: string;
  type: number;
}

export const SceneProvider = ({
  load,
  visible,
  pageProp,
  pagePosition,
  children,
}: {
  load: number;
  visible: boolean;
  pageProp: PageProps;
  pagePosition: PagePosition;
  children: React.ReactNode;
}) => {
  const scenesRef = useRef<Map<string, any>>(new Map());
  const { user } = useUserManager();
  const texturesRef = useRef<{ id: number; texture: PIXI.Texture }[]>([]);
  const avatarTexturesRef = useRef<{ name: string; texture: PIXI.Texture }[]>([]);
  const iconTexturesRef = useRef<{ name: string; texture: PIXI.Texture }[]>([]);
  const [sceneEvent, setSceneEvent] = useState<SceneEvent | null>(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
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
      if (scenesRef.current)
        for (const scene of scenesRef.current.values()) {
          if (scene?.app && !scene.type) {
            (scene.app as PIXI.Application).destroy(true);
          }
        }
    };
  }, []);

  const value = {
    load,
    visible,
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
      if (scene && scenesRef.current) {
        const pscene = scenesRef.current.get(id);
        if (pscene) {
          Object.assign(pscene, scene);
        } else scenesRef.current.set(id, scene);
        // setSceneEvent({ name: id, type: SCENE_EVENT_TYPE.CREATE });
      }
    }, []),

    initialize: useCallback(
      (battle: BattleModel) => {
        if (!pagePosition || !battle.games) return;
        const { column, row } = battle.data;
        const { width, height } = pagePosition;

        const gameScenes: GameScene[] = [];
        const gameConsoleScenes: GameConsoleScene[] = [];
        battle.games.forEach((game, index) => {
          const mode =
            battle.games?.length === 1 || load === BATTLE_LOAD.REPLAY
              ? 0
              : game.uid === user.uid || index === 0
              ? 1
              : 2;

          const gameBound = getGameBound(width, height, column, row, mode);
          if (gameBound) {
            const app = new PIXI.Application({
              width: gameBound.width,
              height: gameBound.height,
              backgroundAlpha: 0,
            });
            const candies = new Map<number, CandySprite>();
            const gameScene = {
              gameId: game.gameId,
              x: gameBound.left,
              y: gameBound.top,
              app,
              width: gameBound.width,
              height: gameBound.height,
              cwidth: gameBound.radius,
              cheight: gameBound.radius,
              candies,
              column: battle.data.column,
              row: battle.data.row,
              mode,
            };
            gameScenes.push(gameScene);
            const gameConsoleBound = getGameConsoleBound(width, height, mode);
            if (gameConsoleBound) {
              const gameConsoleScene = {
                gameId: game.gameId,
                app: null,
                x: gameConsoleBound.left,
                y: gameConsoleBound.top,
                width: gameConsoleBound.width,
                height: gameConsoleBound.height,
                mode,
              };
              gameConsoleScenes.push(gameConsoleScene);
            }
          }
        });
        scenesRef.current.set(SCENE_NAME.GAME_SCENES, gameScenes);
        scenesRef.current.set(SCENE_NAME.GAME_CONSOLES, gameConsoleScenes);

        setSceneEvent({ name: "sceneComplete", type: 1 });
        return;
      },
      [pagePosition]
    ),
  };

  return <>{complete ? <SceneContext.Provider value={value}> {children} </SceneContext.Provider> : null}</>;
};
export const useSceneManager = () => {
  return useContext(SceneContext);
};
export default SceneProvider;

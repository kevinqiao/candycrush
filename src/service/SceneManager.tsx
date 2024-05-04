import candy_textures from "model/candy_textures";
import { SCENE_EVENT_TYPE, SCENE_ID, SCENE_NAME } from "model/Match3Constants";
import * as PIXI from "pixi.js";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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
  gameScenesReady: number;
  gameConsoleScenesReady: number;
  createdScenes: { type: number; id: number; gameId: string; scene: SceneModel }[];
  // stageScene: (id: string, scene: SceneModel | null) => void;
  createScene: (sceneId: number, scene: SceneModel) => void;
  updateScene: (sceneId: number, data: any) => void;
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
  createdScenes: [],
  sceneEvent: null,
  createScene: (sceneId: number, scene: SceneModel) => null,
  updateScene: (sceneId: number, data: any) => null,
  disableCloseBtn: () => null,
  exit: () => null,
});
interface SceneEvent {
  type: number;
  id: number;
  scene: SceneModel;
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
  const [createdScenes, setCreatedScenes] = useState<{ type: number; id: number; gameId: string; scene: SceneModel }[]>(
    []
  );
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
    createdScenes,
    exit: useCallback(() => {
      if (pageProp.close) pageProp.close(0);
    }, [pageProp]),
    disableCloseBtn: useCallback(() => {
      if (pageProp.disableCloseBtn) {
        pageProp.disableCloseBtn();
      }
    }, [pageProp]),

    createScene: useCallback(
      (sceneId: number, scene: SceneModel) => {
        if (!scenesRef.current) return;
        switch (sceneId) {
          case SCENE_ID.GAME_SCENE:
            {
              const gscene = scene as GameScene;
              let gameScenes: GameScene[] = scenesRef.current.get(SCENE_NAME.GAME_SCENES);
              if (!gameScenes) {
                gameScenes = [];
                scenesRef.current.set(SCENE_NAME.GAME_SCENES, gameScenes);
              }
              const gameScene = gameScenes.find((s) => s.gameId === gscene.gameId);
              if (!gameScene) {
                gameScenes.push(gscene);
                setCreatedScenes((pre) => [
                  ...pre,
                  { type: SCENE_EVENT_TYPE.INIT, id: SCENE_ID.GAME_SCENE, gameId: gscene.gameId, scene },
                ]);
                // setTimeout(
                //   () => setSceneEvent({ type: SCENE_EVENT_TYPE.INIT, id: SCENE_ID.GAME_SCENE, scene }),
                //   Math.floor(Math.random() * 30)
                // );
              }
            }
            break;
          case SCENE_ID.GAME_CONSOLE_SCENE:
            {
              const cscene = scene as GameConsoleScene;
              let gameConsoleScenes: GameConsoleScene[] = scenesRef.current.get(SCENE_NAME.GAME_CONSOLES);
              if (!gameConsoleScenes) {
                gameConsoleScenes = [];
                scenesRef.current.set(SCENE_NAME.GAME_CONSOLES, gameConsoleScenes);
              }
              const gameConsoleScene = gameConsoleScenes.find((s) => s.gameId === cscene.gameId);
              if (!gameConsoleScene) {
                gameConsoleScenes.push(cscene);
                setCreatedScenes((pre) => [
                  ...pre,
                  { type: SCENE_EVENT_TYPE.INIT, id: SCENE_ID.GAME_CONSOLE_SCENE, gameId: cscene.gameId, scene },
                ]);
                // setTimeout(
                //   () => setSceneEvent({ type: SCENE_EVENT_TYPE.INIT, id: SCENE_ID.GAME_CONSOLE_SCENE, scene }),
                //   Math.floor(Math.random() * 100)
                // );
              }
            }
            break;
          case SCENE_ID.BATTLE_SCENE:
            break;

          default:
            break;
        }
      },
      [scenesRef.current]
    ),
    updateScene: useCallback(
      (sceneId: number, data: any) => {
        if (!scenesRef.current) return;
        switch (sceneId) {
          case SCENE_ID.GAME_SCENE:
            {
              const gameScenes: GameScene[] | undefined = scenesRef.current.get(SCENE_NAME.GAME_SCENES);
              const gameScene = gameScenes?.find((s) => s.gameId === data.gameId);
              if (gameScene) {
                Object.assign(gameScene, data);
                setSceneEvent({ type: SCENE_EVENT_TYPE.INIT, id: SCENE_ID.GAME_SCENE, scene: gameScene });
              }
            }
            break;
          case SCENE_ID.GAME_CONSOLE_SCENE:
            {
              const gameConsoleScenes: GameConsoleScene[] | undefined = scenesRef.current.get(SCENE_NAME.GAME_CONSOLES);
              const gameConsoleScene = gameConsoleScenes?.find((s) => s.gameId === data.gameId);
              if (gameConsoleScene) {
                Object.assign(gameConsoleScene, data);
                setSceneEvent({
                  type: SCENE_EVENT_TYPE.INIT,
                  id: SCENE_ID.GAME_CONSOLE_SCENE,
                  scene: gameConsoleScene,
                });
              }
            }
            break;
          case SCENE_ID.BATTLE_SCENE:
            break;

          default:
            break;
        }
      },
      [scenesRef.current]
    ),

    // initialize: useCallback(
    //   (battle: BattleModel) => {
    //     if (!pagePosition || !battle.games) return;
    //     const { column, row } = battle.data;
    //     const { width, height } = pagePosition;

    //     const gameScenes: GameScene[] = [];
    //     const gameConsoleScenes: GameConsoleScene[] = [];
    //     battle.games.forEach((game, index) => {
    //       const mode =
    //         battle.games?.length === 1 || load === BATTLE_LOAD.REPLAY
    //           ? 0
    //           : game.uid === user.uid || index === 0
    //           ? 1
    //           : 2;

    //       const gameBound = getGameBound(width, height, column, row, mode);
    //       if (gameBound) {
    //         const app = new PIXI.Application({
    //           width: gameBound.width,
    //           height: gameBound.height,
    //           backgroundAlpha: 0,
    //         });
    //         const candies = new Map<number, CandySprite>();
    //         const gameScene = {
    //           gameId: game.gameId,
    //           x: gameBound.left,
    //           y: gameBound.top,
    //           app,
    //           width: gameBound.width,
    //           height: gameBound.height,
    //           cwidth: gameBound.radius,
    //           cheight: gameBound.radius,
    //           candies,
    //           column: battle.data.column,
    //           row: battle.data.row,
    //           mode,
    //         };
    //         gameScenes.push(gameScene);
    //         const gameConsoleBound = getGameConsoleBound(width, height, mode);
    //         if (gameConsoleBound) {
    //           const gameConsoleScene = {
    //             gameId: game.gameId,
    //             app: null,
    //             x: gameConsoleBound.left,
    //             y: gameConsoleBound.top,
    //             width: gameConsoleBound.width,
    //             height: gameConsoleBound.height,
    //             mode,
    //           };
    //           gameConsoleScenes.push(gameConsoleScene);
    //         }
    //       }
    //     });
    //     scenesRef.current.set(SCENE_NAME.GAME_SCENES, gameScenes);
    //     scenesRef.current.set(SCENE_NAME.GAME_CONSOLES, gameConsoleScenes);
    //     return;
    //   },
    //   [pagePosition]
    // ),
  };

  return <>{complete ? <SceneContext.Provider value={value}> {children} </SceneContext.Provider> : null}</>;
};
export const useSceneManager = () => {
  return useContext(SceneContext);
};
export default SceneProvider;

import { SCENE_ID, SCENE_NAME } from "model/Match3Constants";
import { GameConsoleScene } from "model/SceneModel";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGameManager } from "service/GameManager";
import { useSceneManager } from "service/SceneManager";
import { getGameConsoleBound } from "util/BattleBoundUtil";
import useSceneUtil from "../common/useSceneUtil";
import AvatarBar from "./AvatarBar";
import GoalPanel from "./GoalPanel";

const GameConsole: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const { scenes, containerBound, updateScene } = useSceneManager();
  const { game } = useGameManager();
  const { initGameConsoleScene } = useSceneUtil();
  const [bound, setBound] = useState<{ x: number; y: number; width: number; height: number; mode: number } | null>(
    null
  );
  const boundRef = useRef<{ x: number; y: number; width: number; height: number; mode: number } | null>(null);
  // console.log("game console:" + game?.gameId);

  useEffect(() => {
    if (game && scenes && containerBound && boundRef.current) {
      const gameConsoleScenes = scenes.get(SCENE_NAME.GAME_CONSOLES);
      const gameConsoleScene = gameConsoleScenes?.find((s: GameConsoleScene) => s.gameId === game.gameId);
      if (gameConsoleScene) {
        const { width, height } = containerBound;
        const nbound = getGameConsoleBound(width, height, gameConsoleScene.mode);
        if (
          nbound &&
          (nbound?.top !== boundRef.current?.y ||
            nbound?.left !== boundRef.current.x ||
            nbound?.width !== boundRef.current.width ||
            nbound.height !== boundRef.current.height)
        ) {
          boundRef.current = {
            x: nbound.left,
            y: nbound.top,
            width: nbound?.width,
            height: nbound.height,
            mode: gameConsoleScene.mode,
          };
          updateScene(SCENE_ID.GAME_CONSOLE_SCENE, { ...boundRef.current, gameId: game.gameId });
          setBound(boundRef.current);
        }
      }
    }
  }, [containerBound, scenes, game]);
  useEffect(() => {
    const consoleScene = initGameConsoleScene();
    if (consoleScene) {
      const { x, y, width, height, mode } = consoleScene;
      const b = { x, y, width, height, mode };
      boundRef.current = b;
      setBound(b);
    }
  }, [initGameConsoleScene]);

  // const loadScene = useCallback(
  //   (sceneEle: HTMLDivElement | null) => {
  //     if (sceneEle && game) {
  //       const gameConsoleScenes = scenes?.get(SCENE_NAME.GAME_CONSOLES);
  //       const gameConsoleScene = gameConsoleScenes.find((s: GameConsoleScene) => s.gameId === game.gameId);
  //       if (gameConsoleScene) gameConsoleScene.app = sceneEle;
  //     }
  //   },
  //   [game, scenes]
  // );

  const render = useMemo(() => {
    return (
      <>
        <div
          ref={sceneRef}
          style={{
            position: "absolute",
            top: bound?.y,
            left: bound?.x,
            width: bound?.width,
            height: bound?.height,
            margin: 0,
            borderRadius: 0,
            backgroundColor: "transparent",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: bound?.mode === 1 ? "flex-start" : "flex-end",
            }}
          >
            <div style={{ width: "80%", height: 45 }}>
              {bound && game ? <AvatarBar key="player" layout={bound.mode} game={game} /> : null}
            </div>
            <div style={{ position: "relative", left: -10, width: "80%" }}>
              {bound && game ? <GoalPanel layout={bound.mode} game={game} /> : null}
            </div>
          </div>
        </div>
      </>
    );
  }, [bound, game]);
  return <>{render}</>;
};

export default GameConsole;

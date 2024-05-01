import { SCENE_NAME } from "model/Match3Constants";
import { GameConsoleScene } from "model/SceneModel";
import React, { useCallback, useMemo } from "react";
import { useGameManager } from "service/GameManager";
import { getGameConsoleBound } from "util/BattleBoundUtil";
import { useSceneManager } from "../../../service/SceneManager";
import AvatarBar from "./AvatarBar";
import GoalPanel from "./GoalPanel";

const GameConsole: React.FC = () => {
  const { containerBound, scenes } = useSceneManager();
  const { game } = useGameManager();
  // console.log("game console:" + game?.gameId);

  const bound = useMemo(() => {
    if (game && scenes && containerBound) {
      // if (gameConsoleBound) {
      //   const gameConsoleScene = {
      //     gameId: game.gameId,
      //     app: null,
      //     x: gameConsoleBound.left,
      //     y: gameConsoleBound.top,
      //     width: gameConsoleBound.width,
      //     height: gameConsoleBound.height,
      //     mode,
      //   };
      const gameConsoleScenes = scenes?.get(SCENE_NAME.GAME_CONSOLES);
      const gameConsoleScene = gameConsoleScenes.find((s: GameConsoleScene) => s.gameId === game.gameId);
      if (gameConsoleScene) {
        const { width, height } = containerBound;
        const gameConsoleBound = getGameConsoleBound(width, height, gameConsoleScene.mode);
        if (gameConsoleBound) {
          gameConsoleScene.x = gameConsoleBound?.left;
          gameConsoleScene.y = gameConsoleBound.top;
          gameConsoleScene.width = gameConsoleBound.width;
          gameConsoleScene.height = gameConsoleBound.height;
        }
        return {
          x: gameConsoleScene.x,
          y: gameConsoleScene.y,
          width: gameConsoleScene.width,
          height: gameConsoleScene.height,
          mode: gameConsoleScene.mode,
        };
      }
    }
    return null;
  }, [containerBound, game, scenes]);

  const loadScene = useCallback(
    (sceneEle: HTMLDivElement | null) => {
      if (sceneEle && game) {
        const gameConsoleScenes = scenes?.get(SCENE_NAME.GAME_CONSOLES);
        const gameConsoleScene = gameConsoleScenes.find((s: GameConsoleScene) => s.gameId === game.gameId);
        if (gameConsoleScene) gameConsoleScene.app = sceneEle;
      }
    },
    [game, scenes]
  );

  const render = useMemo(() => {
    return (
      <>
        {bound && game ? (
          <div
            ref={loadScene}
            style={{
              position: "absolute",
              top: bound.y,
              left: bound.x,
              width: bound.width,
              height: bound.height,
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
                alignItems: bound.mode === 1 ? "flex-start" : "flex-end",
              }}
            >
              <div style={{ width: "80%", height: 45 }}>
                <AvatarBar key="player" layout={bound.mode} game={game} />
              </div>
              <div style={{ position: "relative", left: -10, width: "80%" }}>
                <GoalPanel layout={bound.mode} game={game} />
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }, [bound, game]);
  return <>{render}</>;
};

export default GameConsole;

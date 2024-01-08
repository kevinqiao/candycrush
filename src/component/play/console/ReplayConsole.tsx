import { ConsoleScene } from "model/SceneModel";
import { useCallback, useMemo, useRef } from "react";
import { countBaseScore } from "service/GameEngine";
import { SCENE_NAME, SCENE_TYPE } from "../../../model/Constants";
import { useBattleManager } from "../../../service/BattleManager";
import { useSceneManager } from "../../../service/SceneManager";
import GoalPanel from "./GoalPanel";

const ReplayConsole = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { scenes, containerBound, stageScene } = useSceneManager();
  const { battle } = useBattleManager();
  const playerGame = useMemo(() => {
    if (battle && battle.games.length > 0) {
      return battle.games[0];
    }
    return null;
  }, [battle]);

  const load = useCallback(
    (sceneEle: HTMLDivElement | null) => {
      if (containerBound && sceneEle && !sceneContainerRef.current) {
        sceneContainerRef.current = sceneEle;
        const scene = {
          app: sceneEle,
          type: SCENE_TYPE.HTML_DIVELEMENT,
          x: 10,
          y: 20,
          width: containerBound.width * 0.5,
          height: 0,
        };
        stageScene(SCENE_NAME.BATTLE_CONSOLE, scene);
      }
    },
    [containerBound, stageScene]
  );
  const loadScore = useCallback(
    (el: HTMLElement | null) => {
      if (scenes && el && playerGame) {
        const consoleScene = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;

        if (consoleScene && playerGame?.gameId) {
          const gameId = playerGame.gameId;
          if (!consoleScene.avatarBars) consoleScene.avatarBars = [];
          let avatarBar = consoleScene.avatarBars.find((a) => a.gameId === gameId);
          if (!avatarBar) {
            avatarBar = { gameId, avatar: null, bar: null, score: null };
            consoleScene.avatarBars.push(avatarBar);
          }
          avatarBar.score = el;
        }
      }
    },
    [scenes, playerGame]
  );
  return (
    <>
      {containerBound && playerGame ? (
        <div
          ref={load}
          style={{
            // opacity: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            top: 100,
            left: 10,
            width: containerBound.width * 0.45,
            margin: 0,
            borderRadius: 0,
            opacity: 0,
            backgroundColor: "transparent",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "70%", height: 45 }}>
            <div>Score:</div>
            <div ref={(el) => loadScore(el)}>
              <span>{playerGame ? countBaseScore(playerGame.matched) : 0}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "70%", marginTop: 10 }}>
            <GoalPanel layout={1} game={playerGame} />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ReplayConsole;

import React, { useCallback, useMemo, useRef } from "react";
import { SCENE_NAME, SCENE_TYPE } from "../../../model/Constants";
import { useBattleManager } from "../../../service/BattleManager";
import { useSceneManager } from "../../../service/SceneManager";
import AvatarBar from "./AvatarBar";
import GoalPanel from "./GoalPanel";

const GameConsole: React.FC<{ gameId: string }> = ({ gameId }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { containerBound, stageScene } = useSceneManager();
  const { battle, bounds } = useBattleManager();
  const game = useMemo(() => {
    if (battle?.games && gameId) {
      const g = battle.games.find((g) => g.gameId === gameId);
      if (g) return { ...g, data: { ...g.data, matched: [] } };
    }
    return null;
  }, [battle, gameId]);
  const bound = useMemo(() => {
    if (battle && bounds) {
      return bounds.find((b) => b.name === "console");
    }
    return null;
  }, [battle, bounds]);

  const loadScene = useCallback(
    (sceneEle: HTMLDivElement | null) => {
      if (containerBound && sceneEle) {
        const direction = containerBound.width > containerBound.height ? 1 : 0;
        const left = direction > 0 ? containerBound.width * 0.3 : containerBound.width * 0.05;
        const top = direction > 0 ? 20 : 40;
        const width = containerBound.width * 0.4;
        sceneContainerRef.current = sceneEle;
        const scene = {
          app: sceneEle,
          type: SCENE_TYPE.HTML_DIVELEMENT,
          x: left,
          y: top,
          width,
          height: 0,
        };
        stageScene(SCENE_NAME.BATTLE_CONSOLE, scene);
      }
    },
    [containerBound, stageScene]
  );
  console.log(game);
  return (
    <div
      ref={loadScene}
      style={{
        position: "relative",
        top: bound ? bound.top : 0,
        left: bound ? bound.left : 0,
        width: bound ? bound.width : 0,
        margin: 0,
        borderRadius: 0,
        backgroundColor: "transparent",
      }}
    >
      {game ? (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: "80%", height: 45 }}>
            <AvatarBar key="player" layout={0} game={game} />
          </div>
          <div style={{ width: "80%" }}>
            <GoalPanel layout={0} game={game} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GameConsole;

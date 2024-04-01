import React, { useCallback, useMemo, useRef } from "react";
import { BATTLE_LOAD, SCENE_NAME, SCENE_TYPE } from "../../../model/Constants";
import { useBattleManager } from "../../../service/BattleManager";
import { useSceneManager } from "../../../service/SceneManager";
import { useUserManager } from "../../../service/UserManager";
import AvatarBar from "./AvatarBar";
import GoalPanel from "./GoalPanel";

const BattleConsole = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { containerBound, stageScene } = useSceneManager();
  const { load, battle, bounds, allGameLoaded } = useBattleManager();
  const { user } = useUserManager();
  const playerGame = useMemo(() => {
    if (battle?.games && user) {
      const pgame = battle.games.find((g) => g.uid === user.uid);
      return pgame;
    }
    return null;
  }, [battle, user]);
  const opponentGame = useMemo(() => {
    if (battle?.games && user) {
      const ogames = battle.games.filter((g) => g.uid !== user.uid);
      if (ogames.length > 0) return ogames[0];
    }
    return null;
  }, [battle, user, allGameLoaded]);

  const bound = useMemo(() => {
    if (battle && bounds) {
      return bounds.find((b) => b.name === "console");
    }
    return null;
  }, [battle, bounds]);

  const isDual = useMemo(() => {
    if (load !== BATTLE_LOAD.REPLAY && battle?.games?.length === 2) return true;
    return false;
  }, [load, battle]);

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
      {isDual ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "90%" }}>
            {playerGame ? (
              <div style={{ width: "40%", height: 45 }}>
                <AvatarBar key="player" layout={0} game={playerGame} />
              </div>
            ) : null}
            {opponentGame ? (
              <div style={{ width: "40%", height: 45 }}>
                <AvatarBar key="opponent" layout={1} game={opponentGame} />
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", width: "90%", marginTop: 10 }}>
            <div style={{ position: "relative", left: 10, width: "35%" }}>
              {playerGame ? <GoalPanel layout={0} game={playerGame} /> : null}
            </div>

            <div style={{ position: "relative", left: -10, width: "35%" }}>
              {opponentGame ? <GoalPanel layout={1} game={opponentGame} /> : null}
            </div>
          </div>
        </>
      ) : playerGame ? (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: "80%", height: 45 }}>
            <AvatarBar key="player" layout={0} game={playerGame} />
          </div>
          <div style={{ width: "80%" }}>
            <GoalPanel layout={0} game={playerGame} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BattleConsole;

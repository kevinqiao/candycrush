import React, { useCallback, useMemo, useRef } from "react";
import { SCENE_NAME, SCENE_TYPE } from "../../../model/Constants";
import { useBattleManager } from "../../../service/BattleManager";
import { useSceneManager } from "../../../service/SceneManager";
import { useUserManager } from "../../../service/UserManager";
import AvatarBar from "./AvatarBar";
import GoalPanel from "./GoalPanel";

const BattleConsole = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { containerBound, stageScene } = useSceneManager();
  const { battle } = useBattleManager();
  const { user } = useUserManager();
  const playerGame = useMemo(() => {
    if (battle && user) {
      const pgame = battle.games.find((g) => g.uid === user.uid);
      return pgame;
    }
    return null;
  }, [battle, user]);

  const opponentGame = useMemo(() => {
    if (battle && user) {
      const ogames = battle.games.filter((g) => g.uid !== user.uid);
      if (ogames.length > 0) return ogames[0];
    }
    return null;
  }, [battle, user]);
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

  return (
    <>
      {containerBound ? (
        <div
          ref={load}
          style={{
            // opacity: 0,
            position: "relative",
            top: 100,
            left: 10,
            width: containerBound.width * 0.45,
            margin: 0,
            borderRadius: 0,
            opacity: 0,
            backgroundColor: "transparent",
          }}
          onClick={() => console.log("console clicked")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "90%" }}>
            {playerGame ? (
              <div style={{ width: "45%", height: 45 }}>
                <AvatarBar key="player" layout={0} game={playerGame} />
              </div>
            ) : null}

            {opponentGame ? (
              <div style={{ width: "45%", height: 45 }}>
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
        </div>
      ) : null}
    </>
  );
};

export default BattleConsole;

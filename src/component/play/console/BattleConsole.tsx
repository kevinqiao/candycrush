import { useCallback, useMemo, useRef } from "react";
import { SCENE_NAME, SCENE_TYPE } from "../../../model/Constants";
import { useBattleManager } from "../../../service/BattleManager";
import { useSceneManager } from "../../../service/SceneManager";
import AvatarBar from "./AvatarBar";
import GoalPanel from "./GoalPanel";

const BattleConsole = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const playerAvatarRef = useRef<HTMLDivElement | null>(null);
  const { containerBound, stageScene } = useSceneManager();
  const { battle } = useBattleManager();
  const game = useMemo(() => {
    return battle ? battle.games[0] : null;
  }, [battle]);

  const load = useCallback((sceneEle: HTMLDivElement | null) => {
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
  }, []);

  return (
    <>
      {containerBound ? (
        <div
          ref={load}
          style={{
            // opacity: 0,
            position: "relative",
            top: 100,
            left: 20,
            width: containerBound.width * 0.5,
            margin: 0,
            borderRadius: 0,
            backgroundColor: "transparent",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "90%" }}>
            <div ref={playerAvatarRef} style={{ width: "45%", height: 45 }}>
              {game ? <AvatarBar key="player" layout={0} game={game} /> : null}
            </div>

            <div style={{ width: "45%", height: 45 }}>
              {game ? <AvatarBar key="opponent" layout={1} game={game} /> : null}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "90%", marginTop: 10 }}>
            <div style={{ position: "relative", left: 10, width: "35%" }}>
              <GoalPanel layout={0} game={game} />
            </div>

            <div style={{ position: "relative", left: -10, width: "35%" }}>
              <GoalPanel layout={1} game={null} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default BattleConsole;

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
  const { battle, allGameLoaded } = useBattleManager();
  const { user } = useUserManager();
  // const [bound, setBound] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const playerGame = useMemo(() => {
    if (battle?.games && user) {
      const pgame = battle.games.find((g) => g.uid === user.uid);
      return pgame;
    }
    return null;
  }, [battle, user, allGameLoaded]);

  const opponentGame = useMemo(() => {
    if (battle?.games && user) {
      const ogames = battle.games.filter((g) => g.uid !== user.uid);
      if (ogames.length > 0) return ogames[0];
    }
    return null;
  }, [battle, user, allGameLoaded]);
  const bound = useMemo(() => {
    if (!containerBound) return null;
    const direction = containerBound.width > containerBound.height ? 1 : 0;
    const left = direction > 0 ? containerBound.width * 0.3 : containerBound.width * 0.05;
    const top = direction > 0 ? 20 : 40;
    const width = containerBound.width * 0.4;
    return { top, left, width, height: 40 };
  }, [containerBound]);

  const load = useCallback(
    (sceneEle: HTMLDivElement | null) => {
      if (containerBound && sceneEle && !sceneContainerRef.current) {
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
      ref={load}
      style={{
        position: "relative",
        top: bound ? bound.top : 0,
        left: bound ? bound.left : 0,
        width: bound ? bound.width : 0,
        margin: 0,
        borderRadius: 0,
        opacity: 0,
        backgroundColor: "transparent",
      }}
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
  );
};

export default BattleConsole;

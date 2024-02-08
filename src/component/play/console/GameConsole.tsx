import React, { useCallback, useRef } from "react";
import { SCENE_NAME, SCENE_TYPE } from "../../../model/Constants";
import { useSceneManager } from "../../../service/SceneManager";
import AvatarBar from "./AvatarBar";
import GoalPanel from "./GoalPanel";

const GameConsole = ({ game }: { game: { gameId: string; uid: string; matched: any } }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { containerBound, stageScene } = useSceneManager();
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
            {game ? (
              <div style={{ width: "45%", height: 45 }}>
                <AvatarBar key="opponent" layout={1} game={game} />
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "90%", marginTop: 10 }}>
            <div style={{ position: "relative", left: 10, width: "35%" }}>
              {game ? <GoalPanel layout={0} game={game} /> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default GameConsole;

import React, { ReactNode, useCallback, useRef } from "react";
import { SCENE_NAME, SCENE_TYPE } from "../../model/Constants";
import { useSceneManager } from "../../service/SceneManager";

const BattleGround: React.FC<{ children: ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { stageScene } = useSceneManager();

  const load = useCallback((sceneEle: HTMLDivElement | null) => {
    if (sceneEle && !containerRef.current) {
      containerRef.current = sceneEle;
      const scene = {
        app: sceneEle,
        type: SCENE_TYPE.HTML_DIVELEMENT,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
      stageScene(SCENE_NAME.BATTLE_GROUND, scene);
    }
  }, []);

  return (
    <>
      {/* {containerBound ? ( */}
      <div
        ref={load}
        style={{
          position: "relative",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          margin: 0,
          borderRadius: 10,
          // height: containerBound.height,
          backgroundColor: "blue",
        }}
      >
        {children}
      </div>
      {/* ) : null} */}
    </>
  );
};

export default BattleGround;

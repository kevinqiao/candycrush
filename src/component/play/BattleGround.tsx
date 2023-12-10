import { useCallback, useRef } from "react";
import { SCENE_NAME, SCENE_TYPE } from "../../model/Constants";
import { useSceneManager } from "../../service/SceneManager";

const BattleGround = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { containerBound, stageScene } = useSceneManager();
  const load = useCallback((sceneEle: HTMLDivElement | null) => {
    if (containerBound && sceneEle && !containerRef.current) {
      containerRef.current = sceneEle;
      const scene = {
        app: sceneEle,
        type: SCENE_TYPE.HTML_DIVELEMENT,
        x: 0,
        y: 0,
        width: containerBound.width,
        height: containerBound.height,
      };
      stageScene(SCENE_NAME.BATTLE_GROUND, scene);
    }
  }, []);

  return (
    <>
      {containerBound ? (
        <div
          ref={load}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            margin: 0,
            border: 0,
            height: containerBound.height,
            backgroundColor: "blue",
          }}
        ></div>
      ) : null}
    </>
  );
};

export default BattleGround;

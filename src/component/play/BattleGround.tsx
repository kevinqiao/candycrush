import { ReactNode, useCallback, useEffect, useRef } from "react";
import { SCENE_NAME, SCENE_TYPE } from "../../model/Constants";
import { useSceneManager } from "../../service/SceneManager";

const BattleGround: React.FC<{ children: ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { containerBound, stageScene } = useSceneManager();

  useEffect(() => {
    if (containerRef.current) {
      // gsap.to(containerRef.current, { autoAlpha: 0, duration: 0.1 });
    }
  }, []);
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
            position: "relative",
            top: 0,
            left: 0,
            width: "100%",
            margin: 0,
            borderRadius: 10,
            height: containerBound.height,
            backgroundColor: "blue",
          }}
        >
          {children}
        </div>
      ) : null}
    </>
  );
};

export default BattleGround;

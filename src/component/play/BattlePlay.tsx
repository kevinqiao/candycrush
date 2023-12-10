import { ReactNode, useCallback } from "react";
import { useSceneManager } from "../../service/SceneManager";

const BattlePlay = ({ children }: { children: ReactNode }) => {
  const { containerBound } = useSceneManager();
  const load = useCallback((sceneEle: HTMLDivElement | null) => {
    console.log(containerBound);
    if (sceneEle) {
      const { width, height } = sceneEle?.getBoundingClientRect();
      console.log(width + ":" + height);
    }
  }, []);
  return (
    <div ref={load} style={{ position: "relative", width: "100%", height: "100%" }}>
      {children}
    </div>
  );
};

export default BattlePlay;

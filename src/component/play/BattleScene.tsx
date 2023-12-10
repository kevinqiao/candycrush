import * as PIXI from "pixi.js";
import { useCallback, useMemo, useRef } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { useSceneManager } from "../../service/SceneManager";

const BattleScene = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { containerBound, stageScene } = useSceneManager();
  const load = useCallback((el: HTMLDivElement) => {
    if (containerBound && !sceneContainerRef.current) {
      sceneContainerRef.current = el;
      const app: PIXI.Application = new PIXI.Application({
        width: containerBound.width,
        height: containerBound.height,
        backgroundAlpha: 0,
      });
      const scene = { x: 0, y: 0, app, width: containerBound.width, height: containerBound.height };
      el.appendChild(app.view as unknown as Node);
      stageScene(SCENE_NAME.BATTLE_SCENE, scene);
    }
  }, []);

  const render = useMemo(() => {
    return (
      <div
        ref={load}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          margin: 0,
          border: 0,
          backgroundColor: "transparent",
          pointerEvents: "none",
        }}
      ></div>
    );
  }, []);
  return <>{render}</>;
};

export default BattleScene;

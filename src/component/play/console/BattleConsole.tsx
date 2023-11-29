import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { SceneModel, useSceneManager } from "../../../service/SceneManager";

const BattleConsole = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { scenesUpdated, scenes, stageScene } = useSceneManager();
  const [consoleScene, setConsoleScene] = useState<SceneModel | null>(null);
  useEffect(() => {
    if (scenes && scenesUpdated && scenesUpdated.includes(SCENE_NAME.BATTLE_CONSOLE)) {
      const scene = scenes.get(SCENE_NAME.BATTLE_CONSOLE);
      if (scene && !consoleScene) {
        setConsoleScene(scene);
      }
    }
  }, [scenesUpdated, scenes, consoleScene]);
  useEffect(() => {
    if (sceneContainerRef.current && consoleScene) {
      const app = consoleScene.app as PIXI.Application;
      sceneContainerRef.current.appendChild(app.view as unknown as Node);
      stageScene(SCENE_NAME.BATTLE_CONSOLE, sceneContainerRef.current);
    }
  }, [sceneContainerRef, consoleScene, stageScene]);

  const render = useMemo(() => {
    return (
      <div
        ref={sceneContainerRef}
        style={{
          position: "absolute",
          top: consoleScene?.y ?? 0,
          left: consoleScene?.x ?? 0,
          width: consoleScene?.width ?? 0,
          height: consoleScene?.height ?? 0,
          margin: 0,
          border: 0,
          backgroundColor: "white",
        }}
      ></div>
    );
  }, [consoleScene]);
  return <>{render}</>;
};

export default BattleConsole;

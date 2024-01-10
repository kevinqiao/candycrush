import { PagePosition } from "model/PageProps";
import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { useSceneManager } from "../../service/SceneManager";

const BattleScene = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { scenes, containerBound, stageScene } = useSceneManager();

  const init = useCallback((bound: PagePosition) => {
    if (!sceneContainerRef.current) return;
    const app: PIXI.Application = new PIXI.Application({
      width: bound.width,
      height: bound.height,
      backgroundAlpha: 0,
    });
    const scene = { x: bound.left, y: bound.top, app, width: bound.width, height: bound.height };
    sceneContainerRef.current.appendChild(app.view as unknown as Node);
    stageScene(SCENE_NAME.BATTLE_SCENE, scene);
  }, []);

  useEffect(() => {
    if (containerBound && scenes) {
      const battleScene = scenes.get(SCENE_NAME.BATTLE_SCENE);
      if (battleScene?.app) {
        battleScene.width = containerBound.width;
        battleScene.height = containerBound.height;
        const scene = battleScene.app as PIXI.Application;
        scene.renderer.resize(containerBound.width, containerBound.height);
      } else init(containerBound);
    }
  }, [scenes, containerBound, init]);

  return (
    <div
      ref={sceneContainerRef}
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
};

export default BattleScene;

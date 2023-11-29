import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { SceneModel, useSceneManager } from "../../service/SceneManager";
import useBattleAnimate from "../animation/battle/BattleAnimate";

const BattleScene = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { scenesUpdated, scenes, stageScene } = useSceneManager();
  const [battleScene, setBattleScene] = useState<SceneModel | null>(null);
  const { playBattleMatching } = useBattleAnimate();
  const [dimension, setDimension] = useState<{ top: number; left: number; width: number; height: number }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  useEffect(() => {
    if (scenes && scenesUpdated && scenesUpdated.includes(SCENE_NAME.BATTLE_HOME)) {
      const scene = scenes.get(SCENE_NAME.BATTLE_HOME);
      if (scene) {
        if (!battleScene) {
          setBattleScene(scene);
        }
        setDimension({ top: scene.y, left: scene.x, width: scene.width, height: scene.height });
      }
    }
  }, [scenesUpdated, scenes, battleScene]);
  useEffect(() => {
    if (sceneContainerRef.current && battleScene) {
      const app = battleScene.app as PIXI.Application;
      sceneContainerRef.current.appendChild(app.view as unknown as Node);
      stageScene(SCENE_NAME.BATTLE_HOME, sceneContainerRef.current);
    }
  }, [sceneContainerRef, battleScene, stageScene]);

  useEffect(() => {
    if (battleScene) {
      // const background = new PIXI.Graphics();
      // background.beginFill(0x000000, 0); // 0x000000 为黑色，0.5 为透明度
      // background.drawRect(0, 0, battleScene.width, battleScene.height);
      // background.endFill();
      // (battleScene.app as PIXI.Application).stage.addChild(background);
    }
  }, [battleScene]);

  const render = useMemo(() => {
    return (
      <div
        ref={sceneContainerRef}
        style={{
          position: "absolute",
          top: dimension.top,
          left: dimension.left,
          width: dimension.width,
          height: dimension.height,
          margin: 0,
          border: 0,
          backgroundColor: "transparent",
          pointerEvents: "none",
        }}
      ></div>
    );
  }, [battleScene]);
  return <>{render}</>;
};

export default BattleScene;

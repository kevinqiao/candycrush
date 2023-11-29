import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGameManager } from "../../service/GameManager";
import { SceneModel, useSceneManager } from "../../service/SceneManager";
import useGameView from "./GameView";
const GamePlay = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { scenesUpdated, scenes, stageScene } = useSceneManager();
  const [gameScene, setGameScene] = useState<SceneModel | null>(null);
  const { gameId } = useGameManager();
  const [dimension, setDimension] = useState<{ top: number; left: number; width: number; height: number }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  useGameView(gameScene);
  useEffect(() => {
    if (scenes && gameId && scenesUpdated && scenesUpdated.includes(gameId)) {
      const scene = scenes.get(gameId);
      if (scene && !gameScene) {
        console.log("gameplay scene created" + scene.x + ":" + scene.y);
        setGameScene(scene);
        setDimension({ top: scene.y, left: scene.x, width: scene.width, height: scene.height });
      }
    }
  }, [gameId, scenesUpdated, scenes, gameScene]);
  useEffect(() => {
    if (gameId && sceneContainerRef.current && gameScene) {
      const app = gameScene.app as PIXI.Application;
      sceneContainerRef.current.appendChild(app.view as unknown as Node);
      stageScene(gameId, sceneContainerRef.current);
    }
  }, [sceneContainerRef, gameScene, gameId, stageScene]);

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
        }}
      ></div>
    );
  }, [dimension]);
  return <>{render}</>;
};

export default GamePlay;

import * as PIXI from "pixi.js";
import { useCallback, useRef, useState } from "react";
import { useBattleManager } from "../../service/BattleManager";
import { useSceneManager } from "../../service/SceneManager";
import { CandySprite } from "../pixi/CandySprite";
import useGameScene from "./useGameScene";
const GamePlay = ({ gameId }: { gameId: string }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { battle } = useBattleManager();
  const { scenes, containerBound, stageScene } = useSceneManager();
  const [bound, setBound] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useGameScene();
  // useEffect(() => {
  //   if (!containerBound || !battle || !gameId || !sceneContainerRef.current) return;
  //   const top = containerBound.height * 0.35;
  //   const left = containerBound.width * 0.15;
  //   const width = containerBound.width * 0.7;
  //   const height = containerBound.height * 0.6;
  //   const cwidth = Math.floor(width / battle.column);
  //   const cheight = Math.floor(width / battle.column);
  //   const candies = new Map<number, CandySprite>();
  //   const column = battle.column;
  //   const row = battle.row;
  //   const app = new PIXI.Application({
  //     width: width,
  //     height: height,
  //     backgroundAlpha: 0,
  //   });
  //   const scene = { x: left, y: top, app, width, height, cwidth, cheight, candies, column, row };
  //   sceneContainerRef.current.appendChild(app.view as unknown as Node);
  //   stageScene(gameId, scene);
  //   setBound({ top, left, width, height });
  // }, [sceneContainerRef, battle, containerBound, gameId, stageScene]);

  const load = useCallback((el: HTMLDivElement) => {
    // const battlePlay = scenes.get(SCENE_NAME.BATTLE_PLAY);

    let app: PIXI.Application | null = null;
    if (battle && containerBound && !sceneContainerRef.current) {
      sceneContainerRef.current = el;
      const left = containerBound.width * 0.15;
      const top = containerBound.height * 0.35;
      const width = containerBound.width * 0.7;
      const height = containerBound.height * 0.6;
      const cwidth = Math.floor(width / battle.column);
      const cheight = Math.floor(width / battle.column);
      app = new PIXI.Application({
        width,
        height,
        backgroundAlpha: 0,
      });

      const candies = new Map<number, CandySprite>();
      const column = battle.column;
      const row = battle.row;
      const scene = { x: left, y: top, app, width, height, cwidth, cheight, candies, column, row };
      el.appendChild(app.view as unknown as Node);
      stageScene(gameId, scene);
      setBound({ top, left, width, height });
    }
  }, []);
  return (
    <div
      ref={load}
      style={{
        position: "absolute",
        top: bound?.top,
        left: bound?.left,
        width: bound?.width,
        height: bound?.height,
        margin: 0,
        border: 0,
        backgroundColor: "transparent",
      }}
    ></div>
  );
};

export default GamePlay;

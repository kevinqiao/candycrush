import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBattleManager } from "../../service/BattleManager";
import { useGameManager } from "../../service/GameManager";
import { useSceneManager } from "../../service/SceneManager";
import { useUserManager } from "../../service/UserManager";
import { CandySprite } from "../pixi/CandySprite";
import useGameScene from "./useGameScene";
const GamePlay = ({ game }: { game: { gameId: string; uid: string } }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const gameOverRef = useRef<HTMLDivElement | null>(null);
  const { battle } = useBattleManager();
  const { containerBound, stageScene } = useSceneManager();
  const { user } = useUserManager();
  const [bound, setBound] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const { gameEvent } = useGameManager();
  useGameScene();
  useEffect(() => {
    console.log(gameEvent);
  }, [gameEvent]);
  useEffect(() => {
    gsap.to(gameOverRef.current, { alpha: 0.1, duration: 1.8 });
  }, []);

  const load = useCallback((el: HTMLDivElement) => {
    console.log("loading..." + game.gameId);
    // const battlePlay = scenes.get(SCENE_NAME.BATTLE_PLAY);
    let app: PIXI.Application | null = null;
    if (battle && containerBound && !sceneContainerRef.current) {
      sceneContainerRef.current = el;
      let left = containerBound.width * 0.5;
      let top = containerBound.height * 0.55;
      let width = containerBound.width * 0.4;
      let height = containerBound.height * 0.35;
      let cwidth = Math.floor(width / battle.column);
      let cheight = Math.floor(width / battle.column);
      if (user.uid !== game.uid) {
        top = containerBound.height * 0.1;
      }
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
      stageScene(game.gameId, scene);
      setBound({ top, left, width, height });
    }
  }, []);
  return (
    <div
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
    >
      <div ref={load} style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}></div>
      <div
        ref={gameOverRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          backgroundColor: "transparent",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 20, color: "white" }}>Game Over</span>
      </div>
    </div>
  );
};

export default GamePlay;

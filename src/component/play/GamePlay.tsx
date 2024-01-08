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
  const maskRef = useRef<HTMLDivElement | null>(null);
  const gameOverRef = useRef<HTMLDivElement | null>(null);
  const { battle, allGameLoaded } = useBattleManager();
  const { containerBound, stageScene } = useSceneManager();
  const { user } = useUserManager();
  const [bound, setBound] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const { status } = useGameManager();

  useGameScene();
  useEffect(() => {
    // console.log("game status:" + status);
    if (!status) return;
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.fromTo(maskRef.current, { autoAlpha: 1 }, { autoAlpha: 0.7, duration: 1.8 }).fromTo(
      gameOverRef.current,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 1.8 },
      "<"
    );
    tl.play();
  }, [status]);

  const load = useCallback((el: HTMLDivElement) => {
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
        ref={maskRef}
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
          backgroundColor: "black",
          pointerEvents: "none",
        }}
      ></div>
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
          backgroundColor: "transparent",
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <div>
          <span style={{ fontSize: 20, color: "white" }}>Game Over</span>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;

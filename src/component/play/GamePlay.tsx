import { gsap } from "gsap";
import { GameScene } from "model/SceneModel";
import * as PIXI from "pixi.js";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useGameManager } from "service/GameManager";
import { useBattleManager } from "../../service/BattleManager";
import { useSceneManager } from "../../service/SceneManager";
import { useUserManager } from "../../service/UserManager";
import { CandySprite } from "../pixi/CandySprite";
import useGameScene from "./useGameScene";
const GamePlay = () => {
  const { game, gameEvent } = useGameManager();
  const maskRef = useRef<HTMLDivElement | null>(null);
  const gameOverRef = useRef<HTMLDivElement | null>(null);
  const baseRef = useRef<HTMLElement | null>(null);
  const goalRef = useRef<HTMLElement | null>(null);
  const timeRef = useRef<HTMLElement | null>(null);
  const { battle, bounds } = useBattleManager();
  const { scenes, stageScene } = useSceneManager();
  const { user } = useUserManager();
  const bound = useMemo(() => {
    if (bounds && game && user) {
      if (game.uid === user.uid) {
        return bounds.find((b) => b.name === "player");
      } else return bounds.find((b) => b.name === "opponent");
    }
    return null;
  }, [bounds, game, user]);

  // const [bound, setBound] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  // const bound = useMemo(() => {
  //   if (!containerBound || !game || !battle) return null;
  //   const direction = containerBound.width > containerBound.height ? 1 : 0;
  //   const width =
  //     user.uid !== game.uid
  //       ? direction > 0
  //         ? containerBound.width * 0.4 * 0.9
  //         : containerBound.width * 0.5 * 0.9
  //       : direction > 0
  //       ? containerBound.width * 0.6 * 0.9
  //       : containerBound.width * 1.0 * 0.9;

  //   const height =
  //     user.uid !== game.uid
  //       ? direction > 0
  //         ? containerBound.height * 0.5
  //         : containerBound.height * 0.3
  //       : direction > 0
  //       ? containerBound.height * 0.8
  //       : containerBound.height * 0.6;

  //   const cwidth = Math.floor(width / battle.data.column);
  //   const cheight = Math.floor(height / battle.data.row);
  //   const radius = Math.min(cwidth, cheight);
  //   const w = radius * battle.data.column;
  //   const h = radius * battle.data.row;

  //   const left =
  //     user.uid !== game.uid
  //       ? direction > 0
  //         ? containerBound.width * 0.05
  //         : containerBound.width * 0.6
  //       : direction > 0
  //       ? containerBound.width * 0.5
  //       : containerBound.width * 0.2;
  //   const top =
  //     user.uid !== game.uid
  //       ? direction > 0
  //         ? containerBound.height * 0.3
  //         : 50
  //       : direction > 0
  //       ? containerBound.height * 0.2
  //       : containerBound.height * 0.4;

  //   return { top, left, width: w, height: h, radius };
  // }, [containerBound, game, battle]);

  useGameScene();

  useEffect(() => {
    if (user && battle && bound && scenes && game) {
      const { left, top, width, height, radius } = bound;

      const gameScene: GameScene | undefined = scenes.get(game.gameId) as GameScene;

      // const b = { top, left, width, height };
      if (gameScene?.app && radius) {
        // const cwidth = Math.floor((0.8 * width) / battle.data.column);
        // const cheight = Math.floor((0.8 * height) / battle.data.row);
        const scene = gameScene.app as PIXI.Application;
        scene.renderer.resize(width, height);
        // const radius = Math.min(cwidth, cheight);
        if (game.data.cells) {
          game.data.cells.forEach((c: any) => {
            const candy = gameScene.candies.get(c.id);
            if (candy) {
              candy.width = radius;
              candy.height = radius;
              candy.x = c.column * radius + Math.floor(radius / 2);
              candy.y = c.row * radius + Math.floor(radius / 2);
            }
          });
        }
        gameScene.x = left;
        gameScene.y = top;
        gameScene.width = width;
        gameScene.height = height;
        gameScene.cwidth = radius;
        gameScene.cheight = radius;
      }
    }
  }, [battle, scenes, game, bound, user]);

  const load = useCallback(
    (sceneEle: HTMLDivElement | null) => {
      if (!game || !battle || !bound || !sceneEle) return;

      let gameScene: GameScene | undefined = scenes.get(game.gameId) as GameScene;
      let app: PIXI.Application<PIXI.ICanvas>;
      if (!gameScene) {
        const { left, top, width, height } = bound;
        app = new PIXI.Application({
          width,
          height,
          backgroundAlpha: 0,
        });
        const cwidth = Math.floor((0.8 * width) / battle.data.column);
        const cheight = Math.floor((0.8 * height) / battle.data.row);
        const candies = new Map<number, CandySprite>();
        gameScene = {
          x: left,
          y: top,
          app,
          width,
          height,
          cwidth,
          cheight,
          candies,
          column: battle.data.column,
          row: battle.data.row,
        };
        stageScene(game.gameId, gameScene);
      } else {
        app = gameScene.app as PIXI.Application<PIXI.ICanvas>;
      }
      sceneEle.appendChild(app.view as unknown as Node);
    },
    [bound, game, scenes, battle, stageScene]
  );
  useEffect(() => {
    if (gameEvent?.name === "gameOver") {
      const { base, goal, time } = gameEvent.data;
      if (baseRef.current) baseRef.current.innerHTML = base + "";
      if (goalRef.current) goalRef.current.innerHTML = goal + "";
      if (timeRef.current) timeRef.current.innerHTML = time + "";
      const tl = gsap.timeline();
      tl.to(maskRef.current, { autoAlpha: 1, duration: 0.4 });
      tl.to(gameOverRef.current, { autoAlpha: 1, duration: 0.4 }, "<");
      tl.play();
    }
  }, [gameEvent]);
  const render = useMemo(() => {
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
          filter: game?.uid !== user.uid ? "blur(0px)" : "blur(0px)",
        }}
      >
        <div ref={load} style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}></div>

        <div
          ref={maskRef}
          style={{
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
            flexDirection: "column",
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
            color: "white",
          }}
        >
          <div style={{ width: "80%", display: "flex", justifyContent: "center" }}>
            <span style={{ fontSize: 20, color: "white" }}>Game Over</span>
          </div>
          <div style={{ width: "80%", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, color: "white" }}>Base</span>
            <span ref={baseRef} style={{ fontSize: 15, color: "white" }}>
              {100}
            </span>
          </div>
          <div style={{ width: "80%", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, color: "white" }}>Goal</span>
            <span ref={goalRef} style={{ fontSize: 15, color: "white" }}>
              {100}
            </span>
          </div>
          <div style={{ width: "80%", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, color: "white" }}>Time Bonus</span>
            <span ref={timeRef} style={{ fontSize: 15, color: "white" }}>
              {100}
            </span>
          </div>
          <div style={{ marginTop: 50, width: "80%", display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                width: "60%",
                height: 40,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "blue",
                color: "white",
              }}
            >
              Ok
            </div>
          </div>
        </div>
      </div>
    );
  }, [game, bound]);
  return <>{render}</>;
};

export default GamePlay;

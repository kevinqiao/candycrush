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
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { game } = useGameManager();
  const maskRef = useRef<HTMLDivElement | null>(null);
  const gameOverRef = useRef<HTMLDivElement | null>(null);
  const { battle } = useBattleManager();
  const { scenes, containerBound, stageScene } = useSceneManager();
  const { user } = useUserManager();
  // const [bound, setBound] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const bound = useMemo(() => {
    if (!containerBound || !game) return null;
    const direction = containerBound.width > containerBound.height ? 1 : 0;
    // const left = direction>0?containerBound.width * 0.5;
    const left =
      user.uid !== game.uid
        ? direction > 0
          ? containerBound.width * 0.05
          : containerBound.width * 0.5
        : direction > 0
        ? containerBound.width * 0.5
        : containerBound.width * 0.1;
    const top =
      user.uid !== game.uid
        ? direction > 0
          ? containerBound.height * 0.2
          : containerBound.height * 0.1
        : direction > 0
        ? containerBound.height * 0.2
        : containerBound.height * 0.4;

    const width =
      user.uid !== game.uid
        ? containerBound.width * 0.3
        : direction > 0
        ? containerBound.width * 0.45
        : containerBound.width * 0.9;
    const height =
      user.uid !== game.uid
        ? containerBound.width * 0.4
        : direction > 0
        ? containerBound.height * 0.8
        : containerBound.height * 0.5;
    return { top, left, width, height };
  }, [containerBound, game]);

  useGameScene({ loaded: bound != null ? true : false });

  useEffect(() => {
    if (user && battle && bound && scenes && game) {
      const { left, top, width, height } = bound;

      const gameScene: GameScene | undefined = scenes.get(game.gameId) as GameScene;

      // const b = { top, left, width, height };
      if (gameScene?.app) {
        const cwidth = Math.floor((0.8 * width) / battle.data.column);
        const cheight = Math.floor((0.8 * height) / battle.data.row);
        const scene = gameScene.app as PIXI.Application;
        scene.renderer.resize(width, height);
        const radius = Math.min(cwidth, cheight);
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
      if (!game || !battle || !bound || !sceneContainerRef.current) return;
      const gameScene: GameScene | undefined = scenes.get(game.gameId) as GameScene;
      if (!gameScene) {
        console.log("loading game scene");
        const { left, top, width, height } = bound;
        const app = new PIXI.Application({
          width,
          height,
          backgroundAlpha: 0,
        });
        const cwidth = Math.floor((0.8 * width) / battle.data.column);
        const cheight = Math.floor((0.8 * height) / battle.data.row);
        const candies = new Map<number, CandySprite>();
        const scene = {
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
        sceneContainerRef.current.appendChild(app.view as unknown as Node);
        stageScene(game.gameId, scene);
      }
    },
    [bound, game, scenes, battle, stageScene]
  );
  return (
    <div
      key={game?.gameId}
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
        filter: game?.uid !== user.uid ? "blur(25px)" : "blur(0px)",
      }}
    >
      <div ref={sceneContainerRef} style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}></div>

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

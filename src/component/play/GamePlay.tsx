import * as PIXI from "pixi.js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBattleManager } from "../../service/BattleManager";
import { useSceneManager } from "../../service/SceneManager";
import { useUserManager } from "../../service/UserManager";
import { CandySprite } from "../pixi/CandySprite";
import useGameScene from "./useGameScene";
const GamePlay = ({ game }: { game: { gameId: string; uid: string } }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const maskRef = useRef<HTMLDivElement | null>(null);
  const gameOverRef = useRef<HTMLDivElement | null>(null);
  const { battle } = useBattleManager();
  const { scenes, containerBound, stageScene } = useSceneManager();
  const { user } = useUserManager();
  const [bound, setBound] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useGameScene();
  useEffect(() => {
    // console.log("game status:" + status);
    // const tl = gsap.timeline({
    //   onComplete: () => {
    //     tl.kill();
    //   },
    // });
    // tl.fromTo(maskRef.current, { autoAlpha: 1 }, { autoAlpha: 0.7, duration: 1.8 }).fromTo(
    //   gameOverRef.current,
    //   { autoAlpha: 0 },
    //   { autoAlpha: 1, duration: 1.8 },
    //   "<"
    // );
    // tl.play();
  }, []);

  const init = useCallback(
    ({
      top,
      left,
      width,
      height,
      column,
      row,
    }: {
      top: number;
      left: number;
      width: number;
      height: number;
      column: number;
      row: number;
    }) => {
      if (sceneContainerRef.current) {
        const cwidth = Math.floor(width / column);
        const cheight = Math.floor(width / column);
        const app = new PIXI.Application({
          width,
          height,
          backgroundAlpha: 0,
        });

        const candies = new Map<number, CandySprite>();
        const scene = { x: left, y: top, app, width, height, cwidth, cheight, candies, column, row };
        sceneContainerRef.current.appendChild(app.view as unknown as Node);
        stageScene(game.gameId, scene);
      }
    },
    [containerBound, battle]
  );

  useEffect(() => {
    if (user && battle && scenes && containerBound && game) {
      const left = containerBound.width * 0.5;
      const top = user.uid !== game.uid ? containerBound.height * 0.1 : containerBound.height * 0.55;
      const width = containerBound.width * 0.4;
      const height = containerBound.height * 0.35;
      const b = { top, left, width, height };
      const gameScene = scenes.get(game.gameId);

      if (gameScene?.app) {
        const scene = gameScene.app as PIXI.Application;
        scene.renderer.resize(width, height);
      } else init({ ...b, column: battle.data.column, row: battle.data.row });
      setBound(b);
    }
  }, [battle, containerBound, scenes, game, user, init]);
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
      <div
        ref={sceneContainerRef}
        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
        onClick={() => console.log("game play layer...")}
      ></div>

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

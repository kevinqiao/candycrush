import Phaser from "phaser";
import React, { useEffect, useRef, useState } from "react";
import useSceneManager from "../service/SceneManager";

export interface MyScene extends Phaser.Scene {
  gameStartTime: number;
  bg: Phaser.GameObjects.TileSprite;
}

const GamePlayer: React.FC = () => {
  const gameRef = useRef<Phaser.Game>();
  const [scene, setScene] = useState<Phaser.Scene>();
  useSceneManager(scene);

  useEffect(() => {
    console.log("creating game");
    const sceneW = Number(window.innerHeight) * 0.8;
    const sceneH = window.innerWidth;
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.WEBGL,
      antialias: true,
      parent: "game-player",
      width: sceneW,
      height: sceneH,
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
        },
      },
      scene: {
        preload,
        create,
      },
    };

    gameRef.current = new Phaser.Game(config);

    function preload(this: Phaser.Scene) {
      this.load.spritesheet("candies", "assets/gems.png", {
        frameWidth: 100, // width of each candy in the spritesheet
        frameHeight: 100, // height of each candy in the spritesheet
      });
    }

    function create(this: Phaser.Scene) {
      setScene(this);
    }

    return () => {
      if (gameRef.current) gameRef.current.destroy(true);
    };
  }, []);

  return <div id="game-player" />;
};

export default GamePlayer;

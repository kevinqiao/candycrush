import Phaser from "phaser";
import React, { useEffect, useState } from "react";
import useCoordManager from "../service/CoordManager";
import useSceneManager from "../service/SceneManager";

export interface MyScene extends Phaser.Scene {
  gameStartTime: number;
  bg: Phaser.GameObjects.TileSprite;
}

const GamePlayer: React.FC = () => {
  const { width, height } = useCoordManager();
  const [scene, setScene] = useState<Phaser.Scene>();
  useSceneManager(scene);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.WEBGL,
      antialias: true,
      parent: "game-player",
      width: 700,
      height: 1000,
      scale: {
        mode: Phaser.Scale.FIT,
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

    const game = new Phaser.Game(config);

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
      game.destroy(true);
    };
  }, []);

  return <div id="game-player" />;
};

export default GamePlayer;

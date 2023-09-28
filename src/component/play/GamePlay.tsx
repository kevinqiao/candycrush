import * as PIXI from "pixi.js";
import { useEffect, useRef, useState } from "react";
import candy_texture_defs from "../../model/candy_textures";
import useCoord from "../../service/CoordManager";
import useGameManager from "../../service/GameManager";
import useSceneManager from "../../service/SceneManager";

const GamePlay = ({ battleId, gameId, isReplay }: { battleId?: string; gameId: string; isReplay?: boolean }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { sceneW, sceneH } = useCoord();
  const [scene, setScene] = useState<PIXI.Application>();
  const [candy_textures, setCandyTextures] = useState<{ id: number; texture: PIXI.Texture }[]>();
  const { game, swapCell } = useGameManager({ battleId, gameId, isReplay: isReplay ?? false });
  useSceneManager(game, swapCell, scene, candy_textures);

  useEffect(() => {
    // Initialize PixiJS Application
    const app = new PIXI.Application({
      width: sceneW,
      height: sceneH,
      transparent: true,
    } as any);

    if (sceneContainerRef.current) {
      sceneContainerRef.current.appendChild(app.view as unknown as Node);
      const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
      const frameSize = 100;
      const candy_textures = candy_texture_defs.map((c) => {
        const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
        const texture = new PIXI.Texture(baseTexture, rect);
        return { id: c.id, texture };
      });
      setCandyTextures(candy_textures);
    }
    setScene(app);
    return () => {
      app.destroy(true);
    };
  }, [sceneW, sceneH]);

  return <div ref={sceneContainerRef} style={{ width: sceneW, height: sceneH }}></div>;
};

export default GamePlay;

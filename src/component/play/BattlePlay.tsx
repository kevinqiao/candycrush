import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef } from "react";
import candy_texture_defs from "../../model/candy_textures";
import { useBattleManager } from "../../service/BattleManager";
import { GameProvider } from "../../service/GameManager";
import { useSceneManager } from "../../service/SceneManager";
import useDimension from "../../util/useDimension";
import AnimatePlay from "../animation/AnimatePlay";
import GamePlay from "./GamePlay";
import BattleConsole from "./console/BattleConsole";

const BattlePlay = () => {
  const { battle } = useBattleManager();
  const eleRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useDimension(eleRef);
  const { textures } = useSceneManager();

  useEffect(() => {
    if (textures?.length === 0) {
      const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
      const frameSize = 100;
      const all = candy_texture_defs.map((c) => {
        const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
        const texture = new PIXI.Texture(baseTexture, rect);
        return { id: c.id, texture };
      });
      textures.push(...all);
    }
  }, [textures]);

  const playerGameId = useMemo(() => {
    if (battle) return battle.games[0].gameId;
    return null;
  }, [battle]);
  return (
    <div ref={eleRef} style={{ width: "100%", height: "100%", backgroundColor: "blue" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 50,
          width: width * 0.7,
          height: height * 0.3,
          backgroundColor: "transparent",
        }}
      >
        <BattleConsole />
      </div>
      {playerGameId ? (
        <GameProvider key={playerGameId} gameId={playerGameId}>
          <div
            key={"b2"}
            style={{
              position: "absolute",
              top: height * 0.35,
              left: width * 0.1,
              width: width * 0.8,
              height: height * 0.6,
              backgroundColor: "transparent",
            }}
          >
            <GamePlay gameId={playerGameId} />
          </div>
        </GameProvider>
      ) : null}
      ;
      <div
        key={"a2"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: height,
          width: width,
          backgroundColor: "transparent",
          pointerEvents: "none",
        }}
      >
        <AnimatePlay />
      </div>
    </div>
  );
};

export default BattlePlay;

import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef } from "react";
import candy_texture_defs from "../../model/candy_textures";
import { useBattleManager } from "../../service/BattleManager";
import { GameProvider } from "../../service/GameManager";
import { useSceneManager } from "../../service/SceneManager";
import useDimension from "../../util/useDimension";
import BattleScene from "./BattleScene";
import GamePlay from "./GamePlay";
import BattleConsole from "./console/BattleConsole";

const BattlePlay = () => {
  const { battle } = useBattleManager();
  const eleRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useDimension(eleRef);
  const { textures } = useSceneManager();
  console.log(width + ":" + height);
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
        <BattleConsole top={10} left={50} />
      </div>
      {playerGameId ? (
        <GameProvider key={playerGameId} gameId={playerGameId}>
          <div
            key={"b2"}
            style={{
              position: "absolute",
              top: height * 0.35,
              left: width * 0.15,
              width: width * 0.7,
              height: height * 0.6,
              backgroundColor: "transparent",
            }}
          >
            <GamePlay gameId={playerGameId} top={height * 0.35} left={width * 0.15} />
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
        <BattleScene />
      </div>
    </div>
  );
};

export default BattlePlay;

import { AnimateProvider } from "component/animation/AnimateManager";
import React, { useEffect, useRef, useState } from "react";
import BattleProvider from "service/BattleManager";
import GameProvider from "service/GameManager";
import SceneProvider from "service/SceneManager";
import useDimension from "util/useDimension";
import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import useTournamentManager from "../../service/TournamentManager";
import usePageVisibility from "../common/usePageVisibility";
import BattleGround from "./BattleGround";
import BattleScene from "./BattleScene";
import GamePlay from "./GamePlay";
import SearchOpponent from "./SearchOpponent";
import BattleConsole from "./console/BattleConsole";
import BattleReport from "./report/BattleReport";

const PlayHome: React.FC<PageProps> = (pageProp) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const sbattleRef = useRef<BattleModel | null>(null);
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { join, findBattle } = useTournamentManager();
  const browserVisible = usePageVisibility();
  const pagePosition = useDimension(sceneRef);

  useEffect(() => {
    if (battle?.load === 2) return;
    if (!browserVisible) {
      const sbattle = sbattleRef.current;
      if (sbattle) sbattle.load = 1;
      setBattle(null);
    } else {
      setBattle(JSON.parse(JSON.stringify(sbattleRef.current)));
    }
  }, [browserVisible]);
  useEffect(() => {
    if (pageProp.data?.battleId) {
      findBattle(pageProp.data.battleId).then((b) => {
        sbattleRef.current = b;
        setBattle(b);
      });
    } else if (pageProp.data?.battle) {
      sbattleRef.current = pageProp.data.battle;
      setBattle(pageProp.data.battle);
    }
  }, [pageProp]);

  return (
    <div
      ref={sceneRef}
      style={{
        position: "relative",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
      }}
    >
      <SceneProvider pageProp={pageProp} pagePosition={pagePosition}>
        {battle ? (
          <BattleProvider battle={battle}>
            <AnimateProvider>
              <BattleGround>
                <BattleConsole />
                {battle.games.map((g) => (
                  <GameProvider key={g.gameId} game={g}>
                    <GamePlay game={g} />
                  </GameProvider>
                ))}
                <BattleScene />
              </BattleGround>
              <BattleReport />
              <SearchOpponent />
            </AnimateProvider>
          </BattleProvider>
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              display: "flex",
              width: "100%",
              height: "100vh",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "blue",
            }}
          >
            <span style={{ fontSize: 25, color: "white" }}>Loading</span>
          </div>
        )}
      </SceneProvider>
    </div>
  );
};

export default PlayHome;

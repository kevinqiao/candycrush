import { AnimateProvider } from "component/animation/AnimateManager";
import { BATTLE_LOAD } from "model/Constants";
import React, { useEffect, useRef, useState } from "react";
import BattleProvider from "service/BattleManager";
import GameProvider from "service/GameManager";
import SceneProvider from "service/SceneManager";
import useDimension from "util/useDimension";
import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import useTournamentManager from "../../service/TournamentManager";
import BattleGround from "./BattleGround";
import BattleScene from "./BattleScene";
import GamePlay from "./GamePlay";
import SearchOpponent from "./SearchOpponent";
import GameConsole from "./console/GameConsole";

const ReplayHome: React.FC<PageProps> = (pageProp) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const sbattleRef = useRef<BattleModel | null>(null);
  const [battle, setBattle] = useState<BattleModel | null>(null);

  const [game, setGame] = useState<{ gameId: string; uid: string; matched: any } | null>(null);
  const { findBattle } = useTournamentManager();

  const pagePosition = useDimension(sceneRef);
  useEffect(() => {
    const gameId = pageProp.data?.gameId;
    if (gameId) {
      if (pageProp.data.battleId) {
        findBattle(pageProp.data.battleId).then((b) => {
          if (b) {
            sbattleRef.current = b;
            setBattle(JSON.parse(JSON.stringify(b)));
            if (b.games.length > 0) {
              const g = b.games.find((c: any) => c.gameId === gameId);
              setGame(g);
            }
          }
        });
      } else if (pageProp.data.battle) {
        sbattleRef.current = pageProp.data.battle;
        setBattle(JSON.parse(JSON.stringify(pageProp.data.battle)));
        if (pageProp.data.battle.games.length > 0) {
          const g = pageProp.data.battle.games.find((c: any) => c.gameId === gameId);
          setGame(g);
        }
      }
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
      {battle && game ? (
        <SceneProvider pageProp={pageProp} pagePosition={pagePosition}>
          <BattleProvider battle={battle}>
            <AnimateProvider>
              <BattleGround>
                <GameConsole game={game} />
                <GameProvider key={game.gameId} game={game} load={BATTLE_LOAD.REPLAY}>
                  <GamePlay game={game} />
                </GameProvider>
                <BattleScene />
              </BattleGround>
              <SearchOpponent />
            </AnimateProvider>
          </BattleProvider>
        </SceneProvider>
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
    </div>
  );
};

export default ReplayHome;

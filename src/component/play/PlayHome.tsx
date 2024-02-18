import { BattleModel } from "model/Battle";
import { BATTLE_LOAD } from "model/Constants";
import React, { useEffect, useRef, useState } from "react";
import BattleProvider from "service/BattleManager";
import GameProvider from "service/GameManager";
import SceneProvider from "service/SceneManager";
import useDimension from "util/useDimension";
import PageProps from "../../model/PageProps";
import useTournamentManager from "../../service/TournamentManager";
import BattleGround from "./BattleGround";
import BattleScene from "./BattleScene";
import GamePlay from "./GamePlay";
import BattleConsole from "./console/BattleConsole";
import TimeCount from "./console/TimeCount";
import BattleReport from "./report/BattleReport";
import SearchOpponent from "./SearchOpponent";

const PlayHome: React.FC<PageProps> = (pageProp) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const sbattleRef = useRef<BattleModel | null>(null);
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { findBattle } = useTournamentManager();
  const pagePosition = useDimension(sceneRef);

  useEffect(() => {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        // 当标签页从不可见切换到可见时触发
        console.log("标签页切换到可见状态");
        setBattle(JSON.parse(JSON.stringify(sbattleRef.current)));
      } else {
        // 当标签页从可见切换到不可见时触发
        console.log("标签页切换到不可见状态");
        setBattle(null);
      }
    });
  }, []);

  useEffect(() => {
    if (pageProp.data?.battleId) {
      findBattle(pageProp.data.battleId).then((b) => {
        sbattleRef.current = b;
        setBattle(JSON.parse(JSON.stringify(b)));
      });
    } else if (pageProp.data?.battle) {
      sbattleRef.current = pageProp.data.battle;
      setBattle(JSON.parse(JSON.stringify(pageProp.data.battle)));
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
      {battle?.games ? (
        <SceneProvider pageProp={pageProp} pagePosition={pagePosition}>
          <BattleProvider battle={battle}>
            <BattleGround>
              <TimeCount />
              <BattleConsole />
              {battle.games.map((g) => (
                <GameProvider key={g.gameId} gameId={g.gameId} load={BATTLE_LOAD.PLAY}>
                  <GamePlay game={g} />
                </GameProvider>
              ))}
              <BattleScene />
            </BattleGround>
            <BattleReport />
            <SearchOpponent />
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

export default PlayHome;

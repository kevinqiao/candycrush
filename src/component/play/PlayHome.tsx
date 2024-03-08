import { Id } from "convex/_generated/dataModel";
import { BattleModel } from "model/Battle";
import { BATTLE_LOAD } from "model/Constants";
import React, { useEffect, useRef, useState } from "react";
import BattleProvider from "service/BattleManager";
import GameProvider from "service/GameManager";
import SceneProvider from "service/SceneManager";
import { useUserManager } from "service/UserManager";
import useDimension from "util/useDimension";
import PageProps from "../../model/PageProps";
import useTournamentManager from "../../service/TournamentManager";
import BattleGround from "./BattleGround";
import BattleScene from "./BattleScene";
import GamePlay from "./GamePlay";
import BattleConsole from "./console/BattleConsole";
import TimeCount from "./console/TimeCount";
import OpponentMatch from "./match/OpponentMatch";
import OpponentSearch from "./match/OpponentSearch";
import BattleReport from "./report/BattleReport";

interface ControlProps {
  battleId: string;
  load: number; //0-load from search opponent 1-load from non search
}
const PlayControl: React.FC<ControlProps> = ({ battleId, load }) => {
  // const sceneRef = useRef<HTMLDivElement | null>(null);
  const sbattleRef = useRef<BattleModel | null>(null);
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { findBattle } = useTournamentManager();
  // const pagePosition = useDimension(sceneRef);

  useEffect(() => {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        console.log("标签页切换到可见状态");
        setBattle(JSON.parse(JSON.stringify(sbattleRef.current)));
      } else {
        console.log("标签页切换到不可见状态");
        setBattle(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!sbattleRef.current && battleId) {
      findBattle(battleId as Id<"battle">).then((b) => {
        sbattleRef.current = b;
        setBattle(JSON.parse(JSON.stringify(b)));
      });
    }
  }, [battleId]);

  return (
    <>
      {battle ? (
        <BattleProvider battle={battle}>
          <BattleGround>
            <TimeCount />
            <BattleConsole />
            {battle.games &&
              battle.games.map((g) => (
                <GameProvider key={g.gameId} gameId={g.gameId} load={BATTLE_LOAD.PLAY}>
                  <GamePlay />
                </GameProvider>
              ))}
            <BattleScene />
          </BattleGround>
          <BattleReport />
          <OpponentMatch />
        </BattleProvider>
      ) : null}
    </>
  );
};

const PlayHome: React.FC<PageProps> = (pageProp) => {
  const [load, setLoad] = useState<number>(pageProp.data.battleId ? 1 : 0);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pagePosition = useDimension(sceneRef);
  const { userEvent } = useUserManager();
  const [battleId, setBattleId] = useState<string | null>(pageProp.data.battleId);
  useEffect(() => {
    if (userEvent?.name === "battleCreated") {
      setBattleId(userEvent.data.id);
    }
  }, [userEvent]);
  return (
    <>
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
          {battleId ? <PlayControl load={load} battleId={battleId} /> : null}
          <OpponentSearch battleId={battleId} />
        </SceneProvider>
      </div>
    </>
  );
};
export default PlayHome;

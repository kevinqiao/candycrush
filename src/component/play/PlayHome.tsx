import { Id } from "convex/_generated/dataModel";
import { BattleModel } from "model/Battle";
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
import "./play.css";
import BattleReport from "./report/BattleReport";

interface ControlProps {
  battleId: string;
  load: number; //0-load from search opponent 1-reload not finished 2-replay
}
const PlayControl: React.FC<ControlProps> = ({ battleId, load }) => {
  // const sceneRef = useRef<HTMLDivElement | null>(null);
  const sbattleRef = useRef<BattleModel | null>(null);
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { findBattle } = useTournamentManager();

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
                <GameProvider key={g.gameId} gameId={g.gameId} load={load}>
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
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pagePosition = useDimension(sceneRef);
  const { userEvent } = useUserManager();
  const [battleId, setBattleId] = useState<string | null>(pageProp.data.battleId);
  useEffect(() => {
    // console.log(userEvent);
    if (userEvent?.name === "battleCreated") {
      setBattleId(userEvent.data.id);
    }
  }, [userEvent]);
  return (
    <>
      <div ref={sceneRef} className="play_container">
        <SceneProvider pageProp={pageProp} pagePosition={pagePosition}>
          {battleId ? <PlayControl load={pageProp.data.battleId ? 1 : 0} battleId={battleId} /> : null}
          <OpponentSearch battleId={battleId} />
        </SceneProvider>
      </div>
    </>
  );
};
export default PlayHome;

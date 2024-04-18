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
import BattleConsole from "./console/BattleConsole";
import TimeCount from "./console/TimeCount";
import GamePlay from "./GamePlay";
import OpponentMatch from "./match/OpponentMatch";
import OpponentSearch from "./match/OpponentSearch";
import "./play.css";
import BattleReport from "./report/BattleReport";
import SkillControl from "./SkillControl";

interface ControlProps {
  battleId: string;
}
const PlayControl: React.FC<ControlProps> = ({ battleId }) => {
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { findBattle } = useTournamentManager();

  useEffect(() => {
    if (!battle && battleId) {
      findBattle(battleId as Id<"battle">).then((b) => {
        // sbattleRef.current = b;
        setBattle(b);
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
                <GameProvider key={g.gameId} gameId={g.gameId}>
                  <GamePlay />
                </GameProvider>
              ))}
            <BattleScene />
          </BattleGround>
          <SkillControl />
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
        <SceneProvider
          load={pageProp.data.battleId ? BATTLE_LOAD.RELOAD : BATTLE_LOAD.PLAY}
          pageProp={pageProp}
          pagePosition={pagePosition}
        >
          {battleId ? <PlayControl battleId={battleId} /> : null}
          <OpponentSearch battleId={battleId} />
        </SceneProvider>
      </div>
    </>
  );
};
export default PlayHome;

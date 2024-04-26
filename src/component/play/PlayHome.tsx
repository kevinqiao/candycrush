import isPropValid from "@emotion/is-prop-valid";
import { Id } from "convex/_generated/dataModel";
import { BattleModel } from "model/Battle";
import { BATTLE_LOAD } from "model/Constants";
import React, { useEffect, useRef, useState } from "react";
import BattleProvider from "service/BattleManager";
import GameProvider from "service/GameManager";
import SceneProvider from "service/SceneManager";
import { useUserManager } from "service/UserManager";
import { StyleSheetManager } from "styled-components";
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
import SkillControl from "./skill/SkillControl";

interface ControlProps {
  battleId: string;
}
const PlayControl: React.FC<ControlProps> = ({ battleId }) => {
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { findBattle } = useTournamentManager();
  const { user } = useUserManager();

  useEffect(() => {
    if (!battle && battleId) {
      findBattle(battleId as Id<"battle">).then((b) => {
        setBattle(b);
      });
    }
  }, [battleId]);
  const matchCompleted = battle && battle.startTime - Date.now() - user.timelag <= 0 ? true : false;
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
                  {g.uid === user.uid ? <SkillControl /> : null}
                </GameProvider>
              ))}
            <BattleScene />
          </BattleGround>
          <BattleReport />
          {!matchCompleted ? <OpponentMatch /> : null}
        </BattleProvider>
      ) : null}
    </>
  );
};

const PlayHome: React.FC<PageProps> = (pageProp) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pagePosition = useDimension(sceneRef);
  const { userEvent } = useUserManager();
  const [load, setLoad] = useState(-1);
  const [visible, setVisible] = useState(true);
  const [battleId, setBattleId] = useState<string | null>(pageProp.data.battleId);
  useEffect(() => {
    // console.log(userEvent);
    if (userEvent?.name === "battleCreated") {
      setBattleId(userEvent.data.id);
    }
  }, [userEvent]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("tab visible");
        setVisible(true);
      } else {
        console.log("tab invisible");
        setVisible(false);
      }
    };
    setLoad(pageProp.data.battleId ? BATTLE_LOAD.RELOAD : BATTLE_LOAD.PLAY);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  return (
    <>
      <StyleSheetManager shouldForwardProp={(propName) => isPropValid(propName)}>
        <div ref={sceneRef} className="play_container">
          <SceneProvider load={load} visible={visible} pageProp={pageProp} pagePosition={pagePosition}>
            {load >= 0 && battleId ? <PlayControl battleId={battleId} /> : null}
            <OpponentSearch />
          </SceneProvider>
        </div>
      </StyleSheetManager>
    </>
  );
};
export default PlayHome;

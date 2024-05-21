import isPropValid from "@emotion/is-prop-valid";
import { BattleModel } from "model/Battle";
import { BATTLE_LOAD } from "model/Constants";
import React, { useEffect, useMemo, useRef, useState } from "react";
import BattleProvider from "service/BattleManager";
import GameProvider from "service/GameManager";
import SceneProvider from "service/SceneManager";
import { useUserManager } from "service/UserManager";
import { StyleSheetManager } from "styled-components";
import useDimension from "util/useDimension";
import { Id } from "../../convex/_generated/dataModel";
import PageProps from "../../model/PageProps";
import useTournamentManager from "../../service/TournamentManager";
import BattleGround from "./BattleGround";
import BattleScene from "./BattleScene";
import GameConsole from "./console/GameConsole";
import TimeCount from "./console/TimeCount";
import GamePlay from "./GamePlay";
import BattleReady from "./match/BattleReady";
import OpponentSearch from "./match/OpponentSearch";
import "./play.css";
import BattleReport from "./report/BattleReport";

interface ControlProps {
  battleId: string;
}
const PlayControl: React.FC<ControlProps> = ({ battleId }) => {
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { findBattle } = useTournamentManager();
  const { user } = useUserManager();

  useEffect(() => {
    if (!battle && battleId) {
      findBattle(battleId as Id<"battle">).then((b: any) => {
        console.log(b);
        setBattle(b);
      });
    }
  }, [battleId]);

  const matchCompleted = useMemo(() => {
    return battle && battle.startTime - Date.now() - user.timelag <= 0 ? true : false;
  }, [battle, user]);
  return (
    <>
      {battle ? (
        <BattleProvider battle={battle}>
          <BattleGround>
            <TimeCount />
            {battle.games &&
              battle.games.map((g) => (
                <GameProvider key={g.gameId} gameId={g.gameId}>
                  <GamePlay />
                  <GameConsole />
                  {/* {g.uid === user.uid ? <SkillControl /> : null} */}
                </GameProvider>
              ))}
            <BattleScene />
          </BattleGround>
          <BattleReport />
          {!matchCompleted ? <BattleReady /> : null}
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
  const [battleId, setBattleId] = useState<string | null>(pageProp.data ? pageProp.data.battleId : null);

  useEffect(() => {
    if (userEvent?.name === "battleCreated") {
      console.log(userEvent);
      setBattleId(userEvent.data.id);
      setLoad(BATTLE_LOAD.PLAY);
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
    if (!pageProp.data || !pageProp.data.battleId) setLoad(BATTLE_LOAD.PLAY);
    else setLoad(BATTLE_LOAD.RELOAD);
    console.log(pageProp.data);
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
            {load >= 0 && visible && battleId ? <PlayControl battleId={battleId} /> : null}
            <OpponentSearch
              tournament={pageProp.data ? pageProp.data.tournament : null}
              onExit={() => {
                pageProp.close ? pageProp.close(0) : null;
              }}
            />
          </SceneProvider>
        </div>
      </StyleSheetManager>
    </>
  );
};
export default PlayHome;

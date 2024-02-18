import { useEffect, useRef, useState } from "react";
import BattleProvider from "service/BattleManager";
import GameProvider from "service/GameManager";
import SceneProvider from "service/SceneManager";
import useDimension from "util/useDimension";
import PageProps from "../../model/PageProps";
import useTournamentManager from "../../service/TournamentManager";
import { useUserManager } from "../../service/UserManager";

import { BattleModel } from "model/Battle";
import BattleGround from "../play/BattleGround";
import BattleScene from "../play/BattleScene";
import GamePlay from "../play/GamePlay";
import SearchOpponent from "../play/SearchOpponent";
import BattleConsole from "../play/console/BattleConsole";
import BattleReport from "../play/report/BattleReport";

const JoinTourament: React.FC<PageProps> = (pageProp) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const sbattleRef = useRef<BattleModel | null>(null);
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { join, findBattle } = useTournamentManager();
  const { userEvent } = useUserManager();

  const pagePosition = useDimension(sceneRef);

  useEffect(() => {
    const act = pageProp.data?.act;
    let b;
    switch (act) {
      case "join":
        join(pageProp.data.tournamentId);
        break;
      case "load":
        // b = { ...pageProp.data.battle, load: 1 };
        // sbattleRef.current = JSON.parse(JSON.stringify(b));
        // setBattle(b);
        findBattle(pageProp.data.battle.id).then((b) => {
          const bo = { ...b, load: 1 };
          sbattleRef.current = JSON.parse(JSON.stringify(bo));
          setBattle(bo);
        });
        break;
      case "replay":
        break;
      default:
        break;
    }
  }, [pageProp.data, join]);
  useEffect(() => {
    if (userEvent?.name === "battleCreated") {
      sbattleRef.current = { ...userEvent.data };
      setBattle(JSON.parse(JSON.stringify(sbattleRef.current)));
    }
  }, [userEvent]);

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
      {battle ? (
        <BattleProvider battle={battle}>
          <SceneProvider pageProp={pageProp} pagePosition={pagePosition}>
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
          </SceneProvider>
        </BattleProvider>
      ) : null}
    </div>
  );
};

export default JoinTourament;

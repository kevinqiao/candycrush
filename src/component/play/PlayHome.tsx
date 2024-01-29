import { AnimateProvider } from "component/animation/AnimateManager";
import { useEffect, useRef, useState } from "react";
import BattleProvider from "service/BattleManager";
import GameProvider from "service/GameManager";
import SceneProvider from "service/SceneManager";
import useDimension from "util/useDimension";
import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import useTournamentManager from "../../service/TournamentManager";
import { useUserManager } from "../../service/UserManager";
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
  const { userEvent } = useUserManager();
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
        const gameId = pageProp.data.gameId;
        if (gameId) {
          b = { ...pageProp.data.battle, load: 2 };
          b.games = b.games.filter((g: any) => g.gameId === gameId);
          sbattleRef.current = JSON.parse(JSON.stringify(b));
          setBattle(b);
        }
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
          </SceneProvider>
        </BattleProvider>
      ) : null}
    </div>
  );
};

export default PlayHome;

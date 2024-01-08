import { useEffect, useRef, useState } from "react";
import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import BattleProvider from "../../service/BattleManager";
import GameProvider from "../../service/GameManager";
import SceneProvider from "../../service/SceneManager";
import useTournamentManager from "../../service/TournamentManager";
import { useUserManager } from "../../service/UserManager";
import { AnimateProvider } from "../animation/AnimateManager";
import usePageVisibility from "../common/usePageVisibility";
import BattleGround from "./BattleGround";
import BattleScene from "./BattleScene";
import GamePlay from "./GamePlay";
import SearchOpponent from "./SearchOpponent";
import BattleConsole from "./console/BattleConsole";
import BattleReport from "./report/BattleReport";

const PlayHome: React.FC<PageProps> = (pageProp) => {
  const sbattleRef = useRef<BattleModel | null>(null);
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { join } = useTournamentManager();
  const { userEvent } = useUserManager();
  const browserVisible = usePageVisibility();
  // const [rerender, setRerender] = useState(browserVisible);

  useEffect(() => {
    if (battle?.load === 2) return;
    if (!browserVisible) {
      const sbattle = sbattleRef.current;
      if (sbattle) sbattle.load = 1;
      setBattle(null);
    } else {
      setBattle(JSON.parse(JSON.stringify(sbattleRef.current)));
    }
    // if (browserVisible && battle) {
    //   if (!battle.status && battle.load !== 2) {
    //     battle.load = 1;
    //     setRerender(false);
    //   }
    // }
    // gsap.globalTimeline.getChildren(true, true, false).forEach((tween) => tween.kill());

    // return () => {
    //   console.log("cleaning up gsap timeline");
    //   gsap.globalTimeline.getChildren(true, true, false).forEach((tween) => tween.kill());
    // };
  }, [browserVisible]);
  useEffect(() => {
    const act = pageProp.data?.act;
    let b;
    switch (act) {
      case "join":
        join(pageProp.data.tournament);
        break;
      case "load":
        b = { ...pageProp.data.battle, load: 1 };
        sbattleRef.current = JSON.parse(JSON.stringify(b));
        setBattle(b);
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
          <SceneProvider pageProp={pageProp}>
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

import { useEffect, useState } from "react";
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
import ReadyToGo from "./ReadyToGo";

const PlayHome: React.FC<PageProps> = (pageProp) => {
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { join } = useTournamentManager();
  const { userEvent } = useUserManager();
  const browserVisible = usePageVisibility();
  const [rerender, setRerender] = useState(browserVisible);
  const [load, setLoad] = useState(-1);

  useEffect(() => {
    if (!browserVisible) {
      if(battle){
        if(!battle.status){
          battle.load = 1;
          setRerender(false)
        }
      }
      // gsap.globalTimeline.getChildren(true, true, false).forEach((tween) => tween.kill());
    }else
       setRerender(true)
    // return () => {
    //   console.log("cleaning up gsap timeline");
    //   gsap.globalTimeline.getChildren(true, true, false).forEach((tween) => tween.kill());
    // };
  }, [browserVisible, battle]);
  useEffect(() => {  
    if (pageProp.data?.act === "join") {
      join(pageProp.data.tournament);
      setLoad(0);
    } else if (pageProp.data?.act === "load") {    
      setBattle({ ...pageProp.data.battle, load: 1 });
    }
  }, [pageProp.data, join]);
  useEffect(() => {    
    if (userEvent?.name === "battleCreated") {
      setBattle({ ...userEvent.data });
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
    <BattleProvider battle={battle}>
    <SceneProvider pageProp={pageProp}>    
            <AnimateProvider>
      {rerender && battle ? (
            <>
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
              </>
      ) : null}
      <SearchOpponent />
      </AnimateProvider>      
        </SceneProvider>
    </BattleProvider>
    </div>
  );
};

export default PlayHome;

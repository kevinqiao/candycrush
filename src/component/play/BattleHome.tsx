import { useEffect, useState } from "react";
import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import BattleProvider from "../../service/BattleManager";
import useEventSubscriber from "../../service/EventManager";
import GameProvider from "../../service/GameManager";
import SceneProvider from "../../service/SceneManager";
import useTournamentManager from "../../service/TournamentManager";
import { AnimateProvider } from "../animation/AnimateManager";
import usePageVisibility from "../common/usePageVisibility";
import BattleFront from "./BattleFront";
import BattleGround from "./BattleGround";
import BattleScene from "./BattleScene";
import GamePlay from "./GamePlay";
import SearchOpponent from "./SearchOpponent";
import BattleConsole from "./console/BattleConsole";

const BattleHome: React.FC<PageProps> = ({ data, position }) => {
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { join } = useTournamentManager();
  const { event } = useEventSubscriber(["battleCreated"], []);
  const browserVisible = usePageVisibility();
  console.log(battle);
  useEffect(() => {
    if (!browserVisible && battle) {
      battle.load = 1;
      // gsap.globalTimeline.getChildren(true, true, false).forEach((tween) => tween.kill());
    }
    // return () => {
    //   console.log("cleaning up gsap timeline");
    //   gsap.globalTimeline.getChildren(true, true, false).forEach((tween) => tween.kill());
    // };
  }, [browserVisible, battle]);
  useEffect(() => {
    if (data?.act === "join") {
      join(data.tournament);
    } else if (data?.act === "load") {
      setBattle({ ...data.battle, load: 1 });
    }
  }, [data, join]);
  useEffect(() => {
    if (event?.name === "battleCreated") {
      setBattle({ ...event.data });
    }
  }, [event]);

  return (
    <div
      ref={() => console.log("rendering battle home")}
      style={{ position: "relative", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "transparent" }}
    >
      {browserVisible && battle && position ? (
        <SceneProvider containerBound={position}>
          <BattleProvider battle={battle}>
            <AnimateProvider>
              <BattleGround />
              <BattleConsole />
              {battle.games.map((g) => (
                <GameProvider key={g.gameId} game={g}>
                  <GamePlay game={g} />
                </GameProvider>
              ))}
              {!battle.load ? <SearchOpponent /> : null}
              <BattleScene />
              <BattleFront />
            </AnimateProvider>
          </BattleProvider>
        </SceneProvider>
      ) : null}
    </div>
  );
};

export default BattleHome;

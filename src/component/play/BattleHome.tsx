import { useEffect, useRef, useState } from "react";
import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import BattleProvider from "../../service/BattleManager";
import useEventSubscriber from "../../service/EventManager";
import { GameProvider } from "../../service/GameManager";
import SceneProvider from "../../service/SceneManager";
import useTournamentManager from "../../service/TournamentManager";
import useDimension from "../../util/useDimension";
import { AnimateProvider } from "../animation/AnimateManager";
import BattlePlay from "./BattlePlay";
import BattleScene from "./BattleScene";
import GamePlay from "./GamePlay";
import SearchOpponent from "./SearchOpponent";
import BattleConsole from "./console/BattleConsole";

const BattleHome: React.FC<PageProps> = ({ data }) => {
  const eleRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useDimension(eleRef);
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { join } = useTournamentManager();
  const { event } = useEventSubscriber(["battleCreated"], []);

  useEffect(() => {
    if (data?.act === "join") {
      join(data.tournament);
    } else if (data?.act === "load") {
      setBattle({ ...data.battle, load: 1 });
    }
  }, [data, join]);
  useEffect(() => {
    if (event?.name === "battleCreated") {
      setBattle(event.data);
    }
  }, [event]);

  return (
    <div
      ref={eleRef}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "blue" }}
    >
      {battle ? (
        <BattleProvider battle={battle}>
          <SceneProvider width={width} height={height}>
            <AnimateProvider>
              <BattlePlay>
                <BattleConsole />
                <GameProvider gameId={battle?.games.length > 0 ? battle.games[0]["gameId"] : "0"}>
                  <GamePlay />
                </GameProvider>
                {data?.act === "join" ? <SearchOpponent /> : null}
                <BattleScene />
              </BattlePlay>
            </AnimateProvider>
          </SceneProvider>
        </BattleProvider>
      ) : null}
    </div>
  );
};

export default BattleHome;

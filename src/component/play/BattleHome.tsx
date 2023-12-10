import { useEffect, useState } from "react";
import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import BattleProvider from "../../service/BattleManager";
import useEventSubscriber from "../../service/EventManager";
import { GameProvider } from "../../service/GameManager";
import SceneProvider from "../../service/SceneManager";
import useTournamentManager from "../../service/TournamentManager";
import { AnimateProvider } from "../animation/AnimateManager";
import BattleGround from "./BattleGround";
import BattleScene from "./BattleScene";
import GamePlay from "./GamePlay";
import SearchOpponent from "./SearchOpponent";
import BattleConsole from "./console/BattleConsole";

const BattleHome: React.FC<PageProps> = ({ data, position }) => {
  const [load, setLoad] = useState(0);
  const [battle, setBattle] = useState<BattleModel | null>(null);
  const { join } = useTournamentManager();
  const { event } = useEventSubscriber(["battleCreated"], []);

  useEffect(() => {
    if (data?.act === "join") {
      join(data.tournament);
    } else if (data?.act === "load") {
      setLoad(1);
      setBattle({ ...data.battle, load: 1 });
    }
  }, [data, join]);
  useEffect(() => {
    if (event?.name === "battleCreated") {
      setBattle({ ...event.data });
    }
  }, [event]);
  const gameId = battle && battle.games.length > 0 ? battle.games[0]["gameId"] : null;
  return (
    <div style={{ position: "relative", top: 0, left: 0, width: "100%", height: "100%" }}>
      {position ? (
        <SceneProvider containerBound={position}>
          <AnimateProvider>
            {gameId ? (
              <BattleProvider battle={battle} load={load}>
                <BattleGround />
                <BattleConsole />
                <GameProvider gameId={battle && battle.games.length > 0 ? battle.games[0]["gameId"] : "0"}>
                  <GamePlay gameId={gameId} />
                </GameProvider>
                {data?.act === "join" ? <SearchOpponent /> : null}
                <BattleScene />
              </BattleProvider>
            ) : null}
          </AnimateProvider>
        </SceneProvider>
      ) : null}
    </div>
  );
};

export default BattleHome;

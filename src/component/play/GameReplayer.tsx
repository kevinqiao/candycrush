import { useEffect, useState } from "react";
import useEventSubscriber from "../../service/EventManager";
import GamePlay from "./GamePlay";

const GameReplayer = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const { event } = useEventSubscriber(["gameReplay"], ["user"]);
  useEffect(() => {
    if (event?.name === "gameReplay") {
      setGameId(event.data.gameId);
    }
  }, [event]);
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "blue" }}>
      <div style={{ height: 50 }}></div>
      <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
        <GamePlay gameId={gameId} mode={1} />
      </div>
    </div>
  );
};

export default GameReplayer;

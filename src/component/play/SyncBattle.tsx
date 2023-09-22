import { useEffect } from "react";
import BattleModel from "../../model/Battle";
import useCoord from "../../service/CoordManager";
import GamePlay from "./GamePlay";

const SyncBattle = ({ battle }: { battle: BattleModel | undefined }) => {
  const { sceneW, height } = useCoord();

  useEffect(() => {
    if (battle) {
      console.log(battle);
    }
  }, [battle]);

  return (
    <>
      <div style={{ width: sceneW, height: height * 0.8, backgroundColor: "blue" }}>
        <GamePlay gameId={battle?.games[0] ?? null} mode={0} />
      </div>
    </>
  );
};

export default SyncBattle;

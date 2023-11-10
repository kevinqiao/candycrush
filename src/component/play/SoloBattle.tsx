import BattleModel from "../../model/Battle";
import { GameProvider } from "../../service/GameManager";
import { useUserManager } from "../../service/UserManager";
import AnimatePlay from "../animation/AnimatePlay";
import BattleConsole from "./console/BattleConsole";
import GamePlay from "./GamePlay";

const SoloBattle = ({ battle, width, height }: { battle: BattleModel; width: number; height: number }) => {
  const { user } = useUserManager();
 

  return (
    <>
      <div style={{ position: "absolute", top: 10, left: 100, width: width * 0.5, height: height * 0.3 }}>
        <BattleConsole />
      </div>

      <GameProvider gameId={battle.games[0].gameId} isReplay={false} pid={"origin"}>
        <div
          key={"b2"}
          style={{
            position: "absolute",
            top: height * 0.4,
            left: 50,
            width: width * 0.8,
            height: height * 0.6,
            backgroundColor: "transparent",
          }}
        >
          <GamePlay />
        </div>
      </GameProvider>

      <div
        key={"a2"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          backgroundColor: "transparent",
          pointerEvents: "none",
        }}
      >
        <AnimatePlay />
      </div>
    </>
  );
};

export default SoloBattle;

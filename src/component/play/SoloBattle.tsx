import BattleModel from "../../model/Battle";
import { GameProvider } from "../../service/GameManager";
import { useUserManager } from "../../service/UserManager";
import AnimatePlay from "../animation/AnimatePlay";
import BattleConsole from "./console/BattleConsole";
import GamePlay from "./GamePlay";

const SoloBattle = ({ battle, position }: { battle: BattleModel; position: any }) => {
  const { user } = useUserManager();
  const playerGame = user ? battle?.games?.find((g) => g.uid === user.uid) : null;

  return (
    <>
      {playerGame && (
        <GameProvider battleId={battle.id} gameId={playerGame.gameId} isReplay={false} pid={"origin"}>
          <>
            <div style={{ display: "flex", justifyContent: "center", width: "100%", height: position.height * 0.3 }}>
              <div style={{ width: "50%" }}>
                <BattleConsole />
              </div>
            </div>
            <div style={{ height: 10 }} />

            <div
              key={"b2"}
              style={{ display: "flex", justifyContent: "center", width: "100%", backgroundColor: "transparent" }}
            >
              {position ? <GamePlay width={position.width * 0.8} height={position.height * 0.6} pid="origin" /> : null}
            </div>

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
              <AnimatePlay width={position.width} height={position.height} />
            </div>
          </>
        </GameProvider>
      )}
    </>
  );
};

export default SoloBattle;

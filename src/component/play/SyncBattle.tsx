import BattleModel from "../../model/Battle";
import { GameProvider } from "../../service/GameManager";
import { useUserManager } from "../../service/UserManager";
import GamePlay from "./GamePlay";

const SyncBattle = ({ battle, position }: { battle: BattleModel; position: any }) => {
  const { user } = useUserManager();
  const opponentGame = battle?.games?.filter((g) => g.uid !== user.uid)[0];
  const playerGame = battle?.games?.find((g) => g.uid === user.uid);

  return (
    <>
      {opponentGame && (
        <GameProvider battleId={battle.id} gameId={opponentGame["gameId"]} isReplay={false} pid={"mirror"}>
          <div key={"b1"} style={{ display: "flex", justifyContent: "flex-end", width: "100%", paddingRight: "50px" }}>
            {position ? <GamePlay width={position.width * 0.4} height={position.height * 0.27} pid="mirror" /> : null}
            <div style={{ width: 50 }} />
          </div>
        </GameProvider>
      )}
      {playerGame && (
        <GameProvider battleId={battle.id} gameId={playerGame.gameId} isReplay={false} pid={"origin"}>
          <div key={"b2"} style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            {position ? <GamePlay width={position.width * 0.8} height={position.height * 0.6} pid="origin" /> : null}
          </div>
        </GameProvider>
      )}
    </>
  );
};

export default SyncBattle;

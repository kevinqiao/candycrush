import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import { GameProvider } from "../../service/GameManager";
import GamePlay from "./GamePlay";

const BattlePlay: React.FC<PageProps> = ({ data, position }) => {
  const battle = data as BattleModel;

  return (
    <div style={{ width: position?.width, height: position?.height, backgroundColor: "blue" }}>
      <div style={{ height: 50 }} />
      <GameProvider battleId={battle.id} gameId={battle.games[0]} isReplay={false} pid={"mirror"}>
        <div key={"b1"} style={{ display: "flex", justifyContent: "flex-end", width: "100%", paddingRight: "50px" }}>
          {position ? <GamePlay width={position.width * 0.4} height={position.height * 0.27} pid="mirror" /> : null}
          <div style={{ width: 50 }} />
        </div>
      </GameProvider>
      <div style={{ height: 30 }} />
      <GameProvider battleId={battle.id} gameId={battle.games[0]} isReplay={false} pid={"origin"}>
        <div key={"b2"} style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          {position ? <GamePlay width={position.width * 0.8} height={position.height * 0.6} pid="origin" /> : null}
        </div>
      </GameProvider>
    </div>
  );
};

export default BattlePlay;

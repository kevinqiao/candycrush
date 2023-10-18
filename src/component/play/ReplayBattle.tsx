import PageProps from "../../model/PageProps";
import { GameProvider } from "../../service/GameManager";
import GamePlay from "./GamePlay";

const ReplayBattle: React.FC<PageProps> = ({ data, position }) => {
  const { battleId, gameId } = data;
  console.log(data);
  return (
    <div style={{ width: position?.width, height: position?.height, backgroundColor: "blue" }}>
      <GameProvider battleId={battleId} gameId={gameId + ""} isReplay={true} pid={"replay"}>
        <div style={{ height: 250 }}></div>
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          {position ? <GamePlay width={position.width * 0.8} height={position.height * 0.6} /> : null}
        </div>
      </GameProvider>
    </div>
  );
};

export default ReplayBattle;

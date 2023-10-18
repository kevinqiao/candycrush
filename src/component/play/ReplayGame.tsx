import PageProps from "../../model/PageProps";
import { GameProvider } from "../../service/GameManager";
import GamePlay from "./GamePlay";
import ReplayConsole from "./ReplayConsole";

const ReplayGame: React.FC<PageProps> = ({ data, position }) => {
  const { battleId, gameId } = data;

  return (
    <div style={{ width: position?.width, height: position?.height, backgroundColor: "blue" }}>
      {position ? (
        <GameProvider battleId={battleId} gameId={gameId + ""} isReplay={true} pid={"replay"}>
          <div style={{ display: "flex", justifyContent: "center", width: "100%", height: position.height * 0.3 }}>
            <div style={{ width: "50%" }}>
              <ReplayConsole />
            </div>
          </div>
          <div style={{ height: 50 }}></div>
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            {position ? <GamePlay width={position.width * 0.8} height={position.height * 0.7} /> : null}
          </div>
        </GameProvider>
      ) : null}
    </div>
  );
};

export default ReplayGame;

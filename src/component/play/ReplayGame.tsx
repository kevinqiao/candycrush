import PageProps from "../../model/PageProps";
import { GameProvider } from "../../service/GameManager";
import GameConsole from "./console/GameConsole";

const ReplayGame: React.FC<PageProps> = ({ data, position }) => {
  const { battleId, gameId } = data;

  return (
    <div style={{ width: position?.width, height: position?.height, backgroundColor: "blue" }}>
      {position ? (
        <GameProvider gameId={gameId + ""} isReplay={true} pid={"replay"}>
          <div style={{ display: "flex", justifyContent: "center", width: "100%", height: position.height * 0.3 }}>
            <div style={{ width: "50%" }}>
              <GameConsole />
            </div>
          </div>
          <div style={{ height: 50 }}></div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: position.width * 0.8,
              height: position.height * 0.7,
            }}
          >
            {/* {position ? <GamePlay /> : null} */}
          </div>
        </GameProvider>
      ) : null}
    </div>
  );
};

export default ReplayGame;

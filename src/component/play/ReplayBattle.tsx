import PageProps from "../../model/PageProps";
import { GameProvider } from "../../service/GameManager";
import GamePlay from "./GamePlay";

const ReplayBattle: React.FC<PageProps> = ({ data, position }) => {
  const { gameId } = data;
  console.log(data);
  return (
    <div style={{ width: position?.width, height: position?.height, backgroundColor: "blue" }}>
      <GameProvider gameId={gameId + ""} isReplay={true} pid={"replay"}>
        <div style={{ height: 250 }}></div>
        {position ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: position.width * 0.8,
              height: position.height * 0.6,
            }}
          >
            <GamePlay />
          </div>
        ) : null}
      </GameProvider>
    </div>
  );
};

export default ReplayBattle;

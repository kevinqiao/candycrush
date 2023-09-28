import PageProps from "../../model/PageProps";
import GamePlay from "./GamePlay";

const ReplayBattle: React.FC<PageProps> = ({ data }) => {
  const { battleId, gameId } = data;

  return (
    <div style={{ height: "100vh", backgroundColor: "blue" }}>
      <div style={{ height: 50 }}></div>
      {gameId ? <GamePlay battleId={battleId} gameId={gameId} isReplay={true} /> : null}
    </div>
  );
};

export default ReplayBattle;

import BattlePageProps from "../../model/BattlePageProps";
import GamePlay from "./GamePlay";

const SoloBattle: React.FC<BattlePageProps> = ({ battle }) => {
  return (
    <>
      <div style={{ height: "100vh", backgroundColor: "blue" }}>
        <div style={{ height: 100 }} />
        {battle ? <GamePlay gameId={battle.games[0]} mode={0} /> : null}
      </div>
    </>
  );
};

export default SoloBattle;

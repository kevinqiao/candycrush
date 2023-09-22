import BattlePageProps from "../../model/BattlePageProps";
import GamePlay from "./GamePlay";

const BattlePlay: React.FC<BattlePageProps> = ({ battle }) => {
  return (
    <>
      <div style={{ height: "100vh", backgroundColor: "blue" }}>
        <div style={{ height: battle.type === 1 ? 100 : 300 }} />
        {battle ? <GamePlay gameId={battle.games[0]} mode={0} /> : null}
      </div>
    </>
  );
};

export default BattlePlay;

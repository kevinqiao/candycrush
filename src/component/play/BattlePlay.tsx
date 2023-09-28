import BattleModel from "../../model/Battle";
import BattlePageProps from "../../model/PageProps";
import GamePlay from "./GamePlay";

const BattlePlay: React.FC<BattlePageProps> = ({ data }) => {
  const battle = data as BattleModel;
  return (
    <>
      <div style={{ height: "100vh", backgroundColor: "blue" }}>
        <div style={{ height: battle.type === 1 ? 100 : 200 }} />
        {battle ? <GamePlay battleId={battle?.id} gameId={battle.games[0]} /> : null}
      </div>
    </>
  );
};

export default BattlePlay;

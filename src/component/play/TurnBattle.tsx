import BattleModel from "../../model/Battle";
import BattlePageProps from "../../model/PageProps";
import GamePlay from "./GamePlay";

const TurnBattle: React.FC<BattlePageProps> = ({ data }) => {
  const battle = data as BattleModel;
  return (
    <>
      <div style={{ height: "100vh", backgroundColor: "blue" }}>
        <div style={{ height: 400 }} />

        {battle ? <GamePlay gameId={battle.games[0]} /> : null}
      </div>
    </>
  );
};

export default TurnBattle;

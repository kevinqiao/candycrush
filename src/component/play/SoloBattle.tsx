import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import GamePlay from "./GamePlay";

const SoloBattle: React.FC<PageProps> = ({ data }) => {
  const battle = data as BattleModel;
  return (
    <>
      <div style={{ height: "100vh", backgroundColor: "blue" }}>
        <div style={{ height: 100 }} />
        {battle ? <GamePlay gameId={battle.games[0]} /> : null}
      </div>
    </>
  );
};

export default SoloBattle;

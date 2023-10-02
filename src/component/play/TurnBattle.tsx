import BattleModel from "../../model/Battle";
import BattlePageProps from "../../model/PageProps";
import useCoord from "../../service/CoordManager";
import GamePlay from "./GamePlay";

const TurnBattle: React.FC<BattlePageProps> = ({ data }) => {
  const { sceneW, sceneH } = useCoord();
  const battle = data as BattleModel;
  return (
    <>
      <div style={{ height: "100vh", backgroundColor: "blue" }}>
        <div style={{ height: 400 }} />

        {battle ? <GamePlay width={sceneW} height={sceneH} /> : null}
      </div>
    </>
  );
};

export default TurnBattle;

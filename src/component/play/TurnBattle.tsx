import BattleModel from "../../model/Battle";
import BattlePageProps from "../../model/PageProps";
import useCoord from "../../service/CoordManager";

const TurnBattle: React.FC<BattlePageProps> = ({ data }) => {
  const { sceneW, sceneH } = useCoord();
  const battle = data as BattleModel;
  return (
    <>
      <div style={{ height: "100vh", backgroundColor: "blue" }}>
        <div style={{ height: 400 }} />
      </div>
    </>
  );
};

export default TurnBattle;

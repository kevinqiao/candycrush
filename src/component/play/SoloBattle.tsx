import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import useCoord from "../../service/CoordManager";
import GamePlay from "./GamePlay";

const SoloBattle: React.FC<PageProps> = ({ data }) => {
  const { sceneW, sceneH } = useCoord();
  const battle = data as BattleModel;
  return (
    <>
      <div style={{ height: "100vh", backgroundColor: "blue" }}>
        <div style={{ height: 100 }} />
        {battle ? <GamePlay width={sceneW} height={sceneH} /> : null}
      </div>
    </>
  );
};

export default SoloBattle;

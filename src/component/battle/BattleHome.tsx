import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import BattleModel from "../../model/Battle";
import useCoord from "../../service/CoordManager";
import BattleItem from "./BattleItem";
const BattleHome: React.FC = () => {
  const { width, height } = useCoord();
  const battles = useQuery(api.battle.findMyBattles, { uid: "kqiao" });

  return (
    <div
      style={{
        width: "100%",
        height: height,
        backgroundColor: "red",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {battles && battles.map((t: BattleModel) => <BattleItem key={t.id} battle={t} />)}
    </div>
  );
};

export default BattleHome;

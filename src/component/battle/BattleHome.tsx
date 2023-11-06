import { useConvex } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import useCoord from "../../service/CoordManager";
import { useUserManager } from "../../service/UserManager";
const BattleHome: React.FC = () => {
  const { width, height } = useCoord();
  const { user } = useUserManager();
  const [battles, setBattles] = useState<any[]>();
  const convex = useConvex();
  useEffect(() => {
    if (user) convex.query(api.battle.findMyBattles, { uid: user.uid }).then((bs) => setBattles(bs));
  }, [convex, user]);

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
      {/* {battles && battles.map((t: BattleModel) => <BattleItem key={t.id} battle={t} />)} */}
    </div>
  );
};

export default BattleHome;

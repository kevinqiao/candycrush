import { useConvex } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import useCoord from "../../service/CoordManager";
import { useUserManager } from "../../service/UserManager";
import BattleItem, { Battle } from "./BattleItem";
const BattleHome: React.FC = () => {
  const { width, height } = useCoord();
  const { user } = useUserManager();
  const [battles, setBattles] = useState<any[]>();
  const [lastTime,setLastTime] = useState(Date.now());
  const convex = useConvex();
  useEffect(() => {
    if (user) convex.query(api.battle.findMyBattles, { uid: user.uid,lastTime }).then((bs) =>{
       if(bs){
           setBattles(bs.battles);
           setLastTime(bs.time)
       }       
    });
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
      {battles && battles.map((t: Battle,index) => <BattleItem key={index+"battle"} battle={t} />)}
    </div>
  );
};

export default BattleHome;

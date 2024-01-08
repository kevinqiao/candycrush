import { useConvex } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import useCoord from "../../service/CoordManager";
import { useUserManager } from "../../service/UserManager";
import BattleItem, { Battle } from "./BattleItem";
const BattleHome: React.FC = () => {
  const battleRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useCoord();
  const { user } = useUserManager();
  const [battles, setBattles] = useState<any[]>();
  const lastTimeRef = useRef<number>(Date.now());
  const convex = useConvex();

  const listBattles = useCallback(() => {
    if (user) {
      convex.query(api.battle.findMyBattles, { uid: user.uid, lastTime: lastTimeRef.current }).then((bs: any) => {
        if (bs) {
          bs.battles.forEach((b: any) => {
            b.games = b.report;
          });
          setBattles(bs.battles);
          // lastTimeRef.current = bs.time;
        }
      });
    }
  }, [convex, user]);
  useEffect(() => {
    listBattles();
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Div is in the viewport
            console.log("Div is in the viewport");
            // listBattles();
          } else {
            // Div is not in the viewport
            console.log("Div is not in the viewport");
          }
        });
      },
      {
        root: null, // Observing for viewport
        rootMargin: "0px",
        threshold: 0.5, // Adjust as needed
      }
    );

    if (battleRef.current) {
      observer.observe(battleRef.current);
    }

    // Cleanup
    return () => {
      if (battleRef.current) {
        observer.unobserve(battleRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={battleRef}
      style={{
        width: "100%",
        height: height,
        backgroundColor: "red",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {battles && battles.map((t: Battle, index) => <BattleItem key={index + "battle"} battle={t} />)}
    </div>
  );
};

export default BattleHome;

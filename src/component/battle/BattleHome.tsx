import { useConvex } from "convex/react";
import React, { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import useCoord from "../../service/CoordManager";
import { useUserManager } from "../../service/UserManager";
import BattleItem, { Battle } from "./BattleItem";
const BattleHome: React.FC = () => {
  const battleRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useCoord();
  const { user } = useUserManager();
  const lastTimeRef = useRef<number>(0);
  const [battles, setBattles] = useState<any[]>([]);
  // const pageIndexRef = useRef<number>(0);
  const convex = useConvex();

  // useEffect(() => {
  //   if (!user) return;
  //   const to = Date.now() + user.timelag;
  //   console.log(to);
  //   convex.query(api.battle.findMyBattles, { uid: user.uid, to }).then((bs: any) => {
  //     if (bs.length > 0) {
  //       bs.forEach((b: any) => {
  //         b.games = b.report;
  //       });
  //       bs.sort((a: any, b: any) => b.time - a.time);
  //       setBattles(bs);
  //     }
  //   });
  // }, [user, convex]);
  useEffect(() => {
    if (!user) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const to = Date.now() + user.timelag;
            const from = lastTimeRef.current > 0 ? lastTimeRef.current : undefined;
            convex.query(api.battle.findMyBattles, { uid: user.uid, from, to }).then((bs: any) => {
              if (bs.length > 0) {
                bs.forEach((b: any) => {
                  b.games = b.report;
                });
                bs.sort((a: any, b: any) => b.time - a.time);
                lastTimeRef.current = bs[0].time;
                setBattles((pre) => [...bs, ...pre]);
              }
            });
            // console.log("Div is in the viewport");
          } else {
            // Div is not in the viewport
            // console.log("Div is not in the viewport");
          }
        });
      },
      {
        root: null, // Observing for viewport
        rootMargin: "0px",
        threshold: 1, // Adjust as needed
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
  }, [user, convex]);

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

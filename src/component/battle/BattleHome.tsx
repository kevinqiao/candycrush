import { useConvex } from "convex/react";
import { BattleModel } from "model/Battle";
import React, { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import useCoord from "../../service/CoordManager";
import { useUserManager } from "../../service/UserManager";
import BattleItem from "./BattleItem";
import "./battle.css";
const BattleHome: React.FC = () => {
  const battleRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useCoord();
  const { user } = useUserManager();
  const lastTimeRef = useRef<number>(0);
  const [battles, setBattles] = useState<any>(null);
  // const pageIndexRef = useRef<number>(0);
  const convex = useConvex();
  useEffect(() => {
    if (!user) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log(entry.intersectionRatio);
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
                setTimeout(() => setBattles((pre: any) => (pre ? [...bs, ...pre] : bs)), 1000);
              }
            });
            console.log("Div is in the viewport");
          } else {
            // Div is not in the viewport
            console.log("Div is not in the viewport");
          }
        });
      },
      {
        root: null, // Observing for viewport
        rootMargin: "0px",
        threshold: 0.6, // Adjust as needed
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        backgroundColor: "white",
      }}
    >
      {battles ? (
        <div style={{ width: "100%", height: "100%" }}>
          {battles.map((t: BattleModel, index: number) => (
            <BattleItem key={index + "battle"} battle={t} />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default BattleHome;

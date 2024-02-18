import { useConvex } from "convex/react";
import { gsap } from "gsap";
import React, { useEffect, useRef } from "react";
import { api } from "../../../convex/_generated/api";
import { useBattleManager } from "../../../service/BattleManager";
import { useSceneManager } from "../../../service/SceneManager";
import { useUserManager } from "../../../service/UserManager";

const BattleReport: React.FC = () => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const { battle, battleEvent } = useBattleManager();
  const { exit } = useSceneManager();
  const { user } = useUserManager();
  const convex = useConvex();
  useEffect(() => {
    const findReport = async () => {
      if (battle) {
        const report = await convex.action(api.battle.findReport, {
          battleId: battle.id,
        });
        console.log(report);
      }
    };
    if (battleEvent?.name === "battleOver") {
      openReport();
      findReport();
    }
  }, [battleEvent, battle]);
  useEffect(() => {
    gsap.to(reportRef.current, { scale: 0, duration: 0 });
  }, []);

  const openReport = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 0.7, duration: 1.8 }).to(
      reportRef.current,
      { scale: 1, autoAlpha: 1, duration: 1.8 },
      "<"
    );
    tl.play();
  };

  return (
    <>
      <div
        ref={maskRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          backgroundColor: "black",
          pointerEvents: "none",
        }}
      ></div>

      <div
        ref={reportRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          margin: 0,
          border: 0,
          opacity: 0,
          height: "100%",
        }}
      >
        <div
          style={{
            width: "70%",
            height: "50%",
            backgroundColor: "white",
          }}
          onClick={exit}
        ></div>
      </div>
    </>
  );
};

export default BattleReport;

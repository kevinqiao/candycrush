import { useConvex } from "convex/react";
import { gsap } from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useBattleManager } from "../../../service/BattleManager";
import { useSceneManager } from "../../../service/SceneManager";
import { useUserManager } from "../../../service/UserManager";

const BattleReport: React.FC = () => {
  const maskDivRef = useRef<HTMLDivElement | null>(null);
  const reportDivRef = useRef<HTMLDivElement | null>(null);
  const { battle, battleEvent } = useBattleManager();
  const [battleReport, setBattleReport] = useState<any>(null);
  const { exit } = useSceneManager();
  const { user } = useUserManager();
  const convex = useConvex();
  useEffect(() => {
    const findReport = async () => {
      if (battle) {
        const report = await convex.action(api.battle.findReport, {
          battleId: battle.id,
        });

        setBattleReport(report);
        console.log(report);
      }
    };
    if (battleEvent?.name === "battleOver") {
      openReport();
      findReport();
    }
  }, [battleEvent, battle]);
  useEffect(() => {
    gsap.to(reportDivRef.current, { scale: 0, duration: 0 });
  }, []);

  const openReport = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskDivRef.current, { autoAlpha: 0.7, duration: 1.8 }).to(
      reportDivRef.current,
      { scale: 1, autoAlpha: 1, duration: 1.8 },
      "<"
    );
    tl.play();
  };

  return (
    <>
      <div
        ref={maskDivRef}
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
        ref={reportDivRef}
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
            backgroundColor: "blue",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "100%",
              height: "100%",
            }}
          >
            <div style={{ height: "15%" }}></div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "70%",
                height: "70%",
              }}
            >
              {battleReport &&
                battleReport.map((r: any, index: number) => (
                  <div
                    key={r.gameId}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", color: "white" }}
                  >
                    <span>{"base:" + r.result.base}</span>
                    <span>{"time:" + r.result.time}</span>
                    <span>{"goal:" + r.result.goal}</span>
                  </div>
                ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "60%",
                height: "10%",
                backgroundColor: "red",
                borderRadius: 4,
                color: "white",
                fontSize: "20px",
              }}
              onClick={exit}
            >
              <span>Ok</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BattleReport;

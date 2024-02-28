import { useConvex } from "convex/react";
import { gsap } from "gsap";
import React, { useCallback, useEffect, useRef, useState } from "react";
import usePageProp from "service/PagePropProvider";
import { api } from "../../../convex/_generated/api";
import { useBattleManager } from "../../../service/BattleManager";
import { useUserManager } from "../../../service/UserManager";
import ReportItem from "./ReportItem";

const BattleReport: React.FC = () => {
  const maskDivRef = useRef<HTMLDivElement | null>(null);
  const reportDivRef = useRef<HTMLDivElement | null>(null);
  const { battle, battleEvent, allGameLoaded } = useBattleManager();
  const [battleReport, setBattleReport] = useState<any>(null);
  // const { exit } = useSceneManager();
  const { exit } = usePageProp();
  const { user } = useUserManager();
  const convex = useConvex();
  const findReport = useCallback(async () => {
    const abc = 10;
    if (battle) {
      const report = await convex.action(api.battle.findReport, {
        battleId: battle.id,
      });
      console.log(report);
      setBattleReport(report);
    }
  }, [battle]);
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

  useEffect(() => {
    if (!user || !battle || !allGameLoaded) return;
    const mygame = battle.games?.find((g) => g.uid === user.uid);

    const timeLeft = battle.duration + battle.startTime - Date.now() + user.timelag;
    if (battle.status || mygame?.result || timeLeft < 0 || battleEvent?.name === "battleOver") {
      openReport();
      findReport();
    }
  }, [battleEvent, battle, user, allGameLoaded]);

  useEffect(() => {
    gsap.to(reportDivRef.current, { scale: 0, duration: 0 });
  }, []);
  const avatarcss = useCallback((avatar: number) => {
    return {
      width: 40,
      height: 40,
      backgroundImage: `url("avatars/${avatar}.svg")`,
      backgroundSize: "cover",
    };
  }, []);
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
              <ReportItem />
              <ReportItem />
              {/* {battleReport &&
                battleReport.map((r: any, index: number) => (
                  <div
                    key={r.gameId}
                    style={{
                      width: "100%",
                      height: 50,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "white",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                      <div style={{ fontSize: 20, width: 30 }}>{index + 1}</div>
                      <div style={{ width: 60 }}>
                        <div style={avatarcss(r.player.avatar)}></div>
                      </div>
                      <div style={{ fontSize: 12, width: 100, alignItems: "center" }}>{r.player.name}</div>
                    </div>
                    <div style={{ fontSize: 18 }}>{r.score > 0 ? <span>{r.score}</span> : <span>playing</span>}</div>
                  </div>
                ))} */}
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

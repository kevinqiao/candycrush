import { useConvex } from "convex/react";
import { gsap } from "gsap";
import { BATTLE_LOAD } from "model/Constants";
import React, { useCallback, useEffect, useRef, useState } from "react";
import usePageProp from "service/PagePropProvider";
import { useSceneManager } from "service/SceneManager";
import { useUserManager } from "service/UserManager";
import { api } from "../../../convex/_generated/api";
import { useBattleManager } from "../../../service/BattleManager";
import ReportItem from "./ReportItem";
import "./report.css";
export interface GameReport {
  player?: { name: string; avatar: number };
  uid?: string;
  gameId: string;
  score?: number;
  rank?: number;
  assets?: { asset: number; amount: number }[];
}

const BattleReport: React.FC = () => {
  const maskDivRef = useRef<HTMLDivElement | null>(null);
  const reportDivRef = useRef<HTMLDivElement | null>(null);
  const { battle, battleOver } = useBattleManager();
  const [report, setReport] = useState<{ id: string; items: GameReport[]; toCollect?: number } | null>(null);
  // const [gameResults, setGameResults] = useState<GameResult[] | null>(null);
  // const [battleRewards, setBattleRewards] = useState<BattleReward[] | null>(null);
  const { load } = useSceneManager();
  const { exit } = usePageProp();
  const convex = useConvex();
  const { user } = useUserManager();

  const findReport = useCallback(async () => {
    if (battle && user) {
      const { uid, token } = user;
      const battleReport = await convex.action(api.battle.findReport, {
        battleId: battle.id,
        uid,
        token,
      });
      console.log(battleReport);
      battleReport.items.sort((a: any, b: any) => {
        if (typeof a.score === "undefined" && typeof b.score !== "undefined") return -1;
        if (typeof a.score !== "undefined" && typeof b.score === "undefined") return 1;
        if (a.score === b.score) return 0;
        return a.score > b.score ? 1 : -1;
      });
      setReport(battleReport);
    }
  }, [battle, user]);
  const openReport = useCallback(() => {
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
  }, [battle]);

  useEffect(() => {
    if (load !== BATTLE_LOAD.REPLAY && battleOver > 0) {
      openReport();
      findReport();
    }
  }, [load, battleOver]);

  useEffect(() => {
    if (battle) gsap.to(reportDivRef.current, { autoAlpha: 0, scale: 0, duration: 0 });
  }, [battle]);
  const claim = () => {
    console.log("claim reward");
    exit();
  };
  return (
    <>
      <div ref={maskDivRef} className="mask_container"></div>

      <div ref={reportDivRef} className="report_container">
        <div className="report_body">
          <div className="report_content">
            <div style={{ height: "15%" }}></div>
            <div className="items_container">
              {report && report.items.map((r, index) => <ReportItem key={r.gameId} gameReport={r} rank={index + 1} />)}
            </div>
            {report?.toCollect ? (
              <div className="collect_btn" onClick={claim}>
                <span>Collect</span>
              </div>
            ) : (
              <div className="collect_btn" onClick={exit}>
                <span>Ok1</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BattleReport;

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
export interface GameResult {
  player?: { uid: string; name: string; avatar: number };
  uid: string;
  gameId: string;
  result?: any;
}
export interface BattleReward {
  player?: { uid: string; name: string; avatar: number };
  uid: string;
  gameId: string;
  reward: {
    player: { name?: string; avatar?: number };
    uid: string;
    gameId: string;
    result?: { base: number; time: number; goal: number };
    assets: { asset: number; amount: number };
  };
}
const BattleReport: React.FC = () => {
  const maskDivRef = useRef<HTMLDivElement | null>(null);
  const reportDivRef = useRef<HTMLDivElement | null>(null);
  const { battle, battleOver } = useBattleManager();
  const [gameResults, setGameResults] = useState<GameResult[] | null>(null);
  const [battleRewards, setBattleRewards] = useState<BattleReward[] | null>(null);
  const { load } = useSceneManager();
  const { exit } = usePageProp();
  const convex = useConvex();
  const { user } = useUserManager();

  const findReport = useCallback(async () => {
    if (battle && user) {
      const { uid, token } = user;
      const report = await convex.action(api.battle.findReport, {
        battleId: battle.id,
        uid,
        token,
      });
      console.log(report);
      setGameResults(report.games);
      if (report.rewards) setBattleRewards(report.rewards);
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

  return (
    <>
      <div ref={maskDivRef} className="mask_container"></div>

      <div ref={reportDivRef} className="report_container">
        <div className="report_body">
          <div className="report_content">
            <div style={{ height: "15%" }}></div>
            <div className="items_container">
              {gameResults &&
                gameResults.map((r) => <ReportItem key={r.gameId} gameResult={r} rewards={battleRewards} />)}
            </div>
            <div className="ok_btn" onClick={exit}>
              <span>Ok1</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BattleReport;

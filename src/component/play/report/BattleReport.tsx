import { useConvex } from "convex/react";
import { gsap } from "gsap";
import React, { useCallback, useEffect, useRef, useState } from "react";
import usePageProp from "service/PagePropProvider";
import { api } from "../../../convex/_generated/api";
import { useBattleManager } from "../../../service/BattleManager";
import { useUserManager } from "../../../service/UserManager";
import ReportItem from "./ReportItem";
import "./report.css";

const BattleReport: React.FC = () => {
  const maskDivRef = useRef<HTMLDivElement | null>(null);
  const reportDivRef = useRef<HTMLDivElement | null>(null);
  const { battle, battleOver, allGameLoaded } = useBattleManager();
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
    if (battleOver > 0) {
      openReport();
      findReport();
    }
  }, [battleOver]);

  useEffect(() => {
    gsap.to(reportDivRef.current, { scale: 0, duration: 0 });
  }, []);

  return (
    <>
      <div ref={maskDivRef} className="mask_container"></div>

      <div ref={reportDivRef} className="report_container">
        <div className="report_body">
          <div className="report_content">
            <div style={{ height: "15%" }}></div>
            <div className="items_container">
              <ReportItem />
              <ReportItem />
            </div>
            <div className="ok_btn" onClick={exit}>
              <span>Ok</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BattleReport;

import PrizeIcon from "component/icons/PrizeIcon";
import React, { useMemo } from "react";
import { ReportItemModel } from "./BattleReport";
import "./report.css";

const ReportItem: React.FC<ReportItemModel> = ({ uid, player, result }) => {
  const score = useMemo(() => {
    if (result) {
      const { base, time, goal } = result;
      return base + time + goal;
    } else return null;
  }, [result]);
  return (
    <div key={uid} className="report-item">
      <div className="report-trophy">
        <PrizeIcon rank={2}></PrizeIcon>
      </div>
      <div className="score-summary">
        <div>{player?.name}</div>
        <div>{score}</div>
      </div>
      {!result ? <div className="battle-prize">Now Playing</div> : null}
    </div>
  );
};

export default ReportItem;

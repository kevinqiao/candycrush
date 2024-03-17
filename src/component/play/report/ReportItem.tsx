import PrizeIcon from "component/icons/PrizeIcon";
import React, { useMemo } from "react";
import { ReportItemModel } from "./BattleReport";
import "./report.css";

const ReportItem: React.FC<ReportItemModel> = ({ player, result }) => {
  const score = useMemo(() => {
    if (result) return 100;
    else return null;
  }, [result]);
  return (
    <div className="report-item">
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

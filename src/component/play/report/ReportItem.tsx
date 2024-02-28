import PrizeIcon from "component/icons/PrizeIcon";
import React, { useMemo } from "react";
import "./report.css";

const ReportItem: React.FC = () => {
  const render = useMemo(() => {
    return (
      <div className="report-item">
        <div className="report-trophy">
          <PrizeIcon rank={2}></PrizeIcon>
        </div>
        <div className="score-summary"></div>
      </div>
    );
  }, []);
  return <>{render}</>;
};

export default ReportItem;

import PrizeIcon from "component/icons/PrizeIcon";
import React, { useMemo } from "react";
import { BattleReward, GameResult } from "./BattleReport";
import "./report.css";
interface Props {
  gameResult: GameResult;
  rewards: BattleReward[] | null;
}
const ReportItem: React.FC<Props> = ({ gameResult, rewards }) => {
  const score = useMemo(() => {
    if (gameResult?.result) {
      const { base, time, goal } = gameResult.result;
      return base + time + goal;
    } else return null;
  }, [gameResult]);
  return (
    <div key={gameResult.uid} className="report-item">
      <div className="report-trophy">
        <PrizeIcon rank={2}></PrizeIcon>
      </div>
      <div className="score-summary">
        <div>{gameResult.player?.name}</div>
        <div>{score}</div>
      </div>
      {!gameResult.result ? <div className="battle-prize">Now Playing</div> : null}
    </div>
  );
};

export default ReportItem;

import ReportItem from "component/play/report/ReportItem";
import { useConvex } from "convex/react";
import PageProps from "model/PageProps";
import React, { useCallback, useEffect, useState } from "react";
import { useUserManager } from "service/UserManager";
import { api } from "../../convex/_generated/api";
import "./battle.css";
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
const BattleLeaderboard: React.FC<PageProps> = (pageProp) => {
  const { battleId, claim } = pageProp.data;
  const { user } = useUserManager();
  const [gameResults, setGameResults] = useState<GameResult[] | null>(null);
  const [battleRewards, setBattleRewards] = useState<BattleReward[] | null>(null);

  const convex = useConvex();

  const findReport = useCallback(async () => {
    if (battleId && user) {
      const { uid, token } = user;
      const report = await convex.action(api.battle.findReport, {
        battleId,
        uid,
        token,
      });

      setGameResults(report.games);
      if (report.rewards) setBattleRewards(report.rewards);
    }
  }, [battleId, user]);
  useEffect(() => {
    if (battleId) {
      findReport();
    }
  }, [battleId]);

  return (
    <div className="board_container">
      <div className="board_content">
        <div className="board_title">Tournament</div>
        <div style={{ height: 40 }}></div>

        <div className="boarditems_container">
          {gameResults && gameResults.map((r) => <ReportItem key={r.gameId} gameResult={r} rewards={battleRewards} />)}
        </div>
      </div>
      {!claim ? (
        <div className="collect_btn">
          <span>Collect</span>
        </div>
      ) : null}
    </div>
  );
};

export default BattleLeaderboard;

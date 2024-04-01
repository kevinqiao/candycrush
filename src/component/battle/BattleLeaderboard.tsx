import { useConvex } from "convex/react";
import PageProps from "model/PageProps";
import React, { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import LeaderboardItem from "./LeaderboardItem";
import "./battle.css";

const BattleLeaderboard: React.FC<PageProps> = (pageProp) => {
  const { rewards, id: battleId } = pageProp.data;
  const [battleReport, setBattleReport] = useState<[] | null>(null);
  const convex = useConvex();
  useEffect(() => {
    const findPlayers = async (uids: string[]) => {
      const players = await convex.query(api.user.findPlayers, { uids });
      const report = rewards.map((r: any) => {
        const player = players.find((p) => p.uid);
        if (player) return { ...r, ...player };
        else return r;
      });
      setBattleReport(report);
    };
    if (battleId && rewards) {
      const uids = rewards.map((r: any) => r.uid);
      findPlayers(uids);
    }
  }, [battleId, rewards]);
  console.log(battleReport);
  return (
    <div className="board_container">
      <div className="board_content">
        <div className="board_title">Tournament</div>
        <div style={{ height: 40 }}></div>
        {battleReport ? (
          <div className="boarditems_container">
            {battleReport.map((r: any, index: number) => (
              <LeaderboardItem key={index} reward={r} battleId={battleId} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="ok_btn">
        <span>Cancel</span>
      </div>
    </div>
  );
};

export default BattleLeaderboard;

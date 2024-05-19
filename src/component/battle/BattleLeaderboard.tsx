import { GameReport } from "component/play/report/BattleReport";
import ReportItem from "component/play/report/ReportItem";
import { useConvex } from "convex/react";
import { APP_EVENT } from "model/Constants";
import PageProps from "model/PageProps";
import React, { useCallback, useEffect, useState } from "react";
import useEventSubscriber from "service/EventManager";
import usePageProp from "service/PagePropProvider";
import { useUserManager } from "service/UserManager";
import { api } from "../../convex/_generated/api";
import "./battle.css";

const BattleLeaderboard: React.FC<PageProps> = (pageProp) => {
  const { battleId } = pageProp.data;
  const { exit } = usePageProp();
  const { user } = useUserManager();
  const [report, setReport] = useState<{ id: string; items: GameReport[]; toCollect?: number } | null>(null);
  const [toCollect, setToCollect] = useState(0);
  const { createEvent } = useEventSubscriber([], []);

  const convex = useConvex();

  const findReport = useCallback(async () => {
    if (battleId && user) {
      const { uid, token } = user;
      const battleReport = await convex.action(api.battle.findReport, {
        battleId,
        uid,
        token,
      });
      battleReport.items.sort((a: any, b: any) => {
        if (typeof a.rank === "undefined" && typeof b.rank !== "undefined") return -1;
        if (typeof a.rank !== "undefined" && typeof b.rank === "undefined") return 1;
        if (a.rank === b.rank) return 0;
        return a.rank > b.rank ? 1 : -1;
      });
      setToCollect(battleReport.toCollect);
      setReport(battleReport);
    }
  }, [battleId, user]);
  useEffect(() => {
    if (battleId) {
      findReport();
    }
  }, [battleId]);
  const collect = useCallback(async () => {
    if (!report || !user) return;
    const gameItem = report.items.find((item) => item.uid === user.uid);
    if (gameItem) {
      const res = await convex.action(api.battle.claim, {
        uid: user.uid,
        token: user.token,
        gameId: gameItem.gameId,
      });
      if (res.ok) {
        createEvent({
          name: APP_EVENT.REWARD_CLAIM,
          topic: gameItem.gameId,
          data: { gameId: gameItem.gameId },
          delay: 0,
        });
        exit();
        setToCollect(0);
      }
    }
  }, [convex, user, report]);
  return (
    <div className="board_container">
      <div className="board_content">
        <div className="board_title">Tournament</div>
        <div style={{ height: 40 }}></div>
        <div className="boarditems_container">
          {report && report.items.map((r, index) => <ReportItem key={r.gameId} gameReport={r} rank={index + 1} />)}
        </div>
      </div>
      {toCollect ? (
        <div className="collect_btn" onClick={collect}>
          <span>Collect</span>
        </div>
      ) : null}
    </div>
  );
};

export default BattleLeaderboard;

import RewardItem from "component/battle/RewardItem";
import DateIcon from "component/icons/DateIcon";
import LeaderboardIcon from "component/icons/LeaderboardIcon";
import PlayersIcon from "component/icons/PlayersIcon";
import PrizeIcon from "component/icons/PrizeIcon";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePageManager } from "service/PageManager";
import useCoord from "service/TerminalManager";
import "./battle.css";
const TounamentTitle: React.FC = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState(20);

  const calculateFontSize = () => {
    if (divRef.current) {
      const divWidth = divRef.current.offsetWidth;
      const newFontSize = divWidth / 55; // 示例计算方法
      setFontSize(newFontSize);
    }
  };

  useEffect(() => {
    calculateFontSize();
    window.addEventListener("resize", calculateFontSize);
    return () => {
      window.removeEventListener("resize", calculateFontSize);
    };
  }, []);
  return (
    <div ref={divRef} style={{ display: "flex", alignItems: "center", width: "100%", height: "100%" }}>
      <span className="roboto-black-italic" style={{ fontSize: Math.max(fontSize + 5, 20) }}>
        Tournament
      </span>
    </div>
  );
};
interface Props {
  battleId: string;
  time: number;
  reward: any;
  participants: number;
  claim?: number; //0-to claim 1-claimed
}

const BattleItem: React.FC<Props> = ({ battleId, time, claim, reward, participants }) => {
  const { width, height } = useCoord();
  const { openPage } = usePageManager();

  const collect = useCallback(() => {
    console.log("do collection");
  }, [battleId]);

  const openLeaderboard = () => {
    openPage({ name: "leaderboard", ctx: "match3", data: { battleId, claim } });
  };

  return (
    <div className="battle-item roboto-regular" style={{ width: width > height ? "90%" : "100%" }}>
      <div className="trophy">{reward ? <PrizeIcon rank={reward.rank + 1}></PrizeIcon> : null}</div>
      <div style={{ width: "65%" }}>
        <div style={{ height: "30%", width: "100%" }}>
          <TounamentTitle />
        </div>
        <div className="summary roboto-regular">
          <div style={{ width: "45%", maxWidth: 150, marginLeft: 5 }}>
            <PlayersIcon players={participants} />
          </div>
          <div style={{ width: "45%", maxWidth: 150 }}>
            <DateIcon date={moment(time).format("MM-DD HH:mm")} />
          </div>
          <div style={{ width: "55%", maxWidth: 200, marginLeft: 30 }} onClick={openLeaderboard}>
            <LeaderboardIcon />
          </div>
        </div>
        <div style={{ height: 20 }}></div>
      </div>
      <div className="reward">
        <div style={{ height: "100%" }}>{reward ? <RewardItem claim={claim ?? 0} reward={reward} /> : null}</div>
      </div>
    </div>
  );
};

export default BattleItem;

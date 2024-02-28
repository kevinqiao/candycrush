import DateIcon from "component/icons/DateIcon";
import LeaderboardIcon from "component/icons/LeaderboardIcon";
import PlayersIcon from "component/icons/PlayersIcon";
import PrizeIcon from "component/icons/PrizeIcon";
import RewardIcon from "component/icons/RewardIcon";
import { BattleModel } from "model/Battle";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePageManager } from "../../service/PageManager";
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
  battle: BattleModel;
}

const BattleItem: React.FC<Props> = ({ battle }) => {
  const { openPage } = usePageManager();

  const openReplay = useCallback(
    (report: any) => {
      openPage({ name: "battleReplay", ctx: "playplace", data: { act: "replay", battle, gameId: report.gameId } });
    },
    [battle, openPage]
  );
  const collect = useCallback(() => {
    console.log("do collection");
  }, [battle]);
  const openLeaderBoard = useCallback(() => {
    openPage({ name: "leaderBoard", ctx: "playplace", data: { battle } });
  }, [battle, openPage]);

  const render = useMemo(() => {
    return (
      <div className="battle-item roboto-regular">
        <div className="trophy">
          <PrizeIcon rank={2}></PrizeIcon>
        </div>
        <div style={{ width: "65%" }}>
          <div style={{ height: "30%", width: "100%" }}>
            <TounamentTitle />
          </div>
          <div className="summary roboto-regular">
            <div style={{ width: "45%", maxWidth: 150, marginLeft: 5 }}>
              <PlayersIcon players={5} />
            </div>
            <div style={{ width: "45%", maxWidth: 150 }}>
              <DateIcon date={"24/02/2024"} />
            </div>
            <div style={{ width: "55%", maxWidth: 200, marginLeft: 30 }} onClick={openLeaderBoard}>
              <LeaderboardIcon />
            </div>
          </div>
          <div style={{ height: 20 }}></div>
        </div>
        <div className="reward">
          <div style={{ height: "100%" }}>
            <RewardIcon amount={"12"} />
          </div>
        </div>
      </div>
    );
  }, [battle]);
  return <>{render}</>;
};

export default BattleItem;

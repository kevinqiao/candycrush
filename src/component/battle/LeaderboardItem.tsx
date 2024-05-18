import DollarIcon from "component/icons/DollarIcon";
import PrizeIcon from "component/icons/PrizeIcon";
import React, { useCallback } from "react";
import { usePageManager } from "service/PageManager";
import "./battle.css";

interface Props {
  battleId: string;
  reward?: any;
}
const LeaderboardItem: React.FC<Props> = ({ battleId, reward }) => {
  const { openPage } = usePageManager();
  const openReplay = useCallback(() => {
    if (battleId && reward?.gameId)
      openPage({ name: "battleReplay", ctx: "match3", data: { battleId, gameId: reward.gameId } });
  }, [battleId, reward]);
  const avatarcss = {
    width: "90%",
    height: "90%",
    backgroundImage: `url("avatars/${reward.avatar}.svg")`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
  };
  return (
    <>
      {reward ? (
        <div className="board-item">
          <div className="board-trophy">
            <PrizeIcon rank={reward.rank + 1}></PrizeIcon>
          </div>
          <div className="board-item-avatar">
            <div style={avatarcss} />
          </div>
          <div className="board-item-name">
            <div>{reward.name}</div>
            <div style={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
              <div>{reward.score}</div>
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "40%",
                  height: 25,
                  backgroundColor: "blue",
                  fontSize: 10,
                  color: "white",
                  borderRadius: 4,
                }}
                onClick={openReplay}
              >
                Replay
              </div>
            </div>
          </div>
          <div className="board-item-reward">
            <DollarIcon amount={40} vertical={1} />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default LeaderboardItem;

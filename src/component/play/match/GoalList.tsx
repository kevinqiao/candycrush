import React, { useMemo } from "react";
import { GAME_GOAL } from "../../../model/Match3Constants";
import { useBattleManager } from "../../../service/BattleManager";
import GoalCandy from "../console/GoalCandy";

const GoalList: React.FC = () => {

  const { battle } = useBattleManager();

  const goals = useMemo(() => {
    if (battle?.data.goal) {
      const battleGoal = GAME_GOAL.find((g) => g.id === battle.data.goal);
    }
    return [];
  }, [battle]);

  return (
    <div>
      {goals.map((r, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: "100%",
            backgroundColor: "blue",
            marginTop: 5,
          }}
        >
          {r.map((a) => (
            <div
              key={a.asset}
              style={{
                display: "flex",
                justifyContent: "flex-start",
                width: "100%",
                backgroundColor: "transparent",
              }}
            >
              <div style={{ position: "relative" }}>
                <div style={{ width: 25, height: 25 }}>
                  <GoalCandy asset={a.asset} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GoalList;

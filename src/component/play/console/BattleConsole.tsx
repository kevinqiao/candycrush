import { useMemo, useState } from "react";
import { useBattleManager } from "../../../service/BattleManager";

const BattleConsole: React.FC = () => {
  const { gamescores } = useBattleManager();
  const [pasttime, setPasttime] = useState(0);
  // console.log(gamescores);
  const timerDiv = useMemo(() => {
    return <div style={{ height: 30 }}>{pasttime > 0 ? <div>Timer:{pasttime}</div> : <div />}</div>;
  }, [pasttime]);
  const scoreDiv = useMemo(() => {
    return gamescores.map((s: any) => (
      <div key={s.gameId} style={{ height: 30 }}>
        <div>
          Player:{s.player.name} Score:{s.score.base}
        </div>{" "}
      </div>
    ));
  }, [gamescores]);

  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "white" }}>
      <div style={{ height: 15 }}></div>
      {scoreDiv}
    </div>
  );
};

export default BattleConsole;

import { useEffect, useMemo, useState } from "react";
import { useGameManager } from "../../../service/GameManager";

const GameConsole: React.FC = () => {
  const { starttime, matched } = useGameManager();
  const [pasttime, setPasttime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPasttime(Math.round(Date.now() - starttime));
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [starttime]);
  const timerDiv = useMemo(() => {
    return <div style={{ height: 30 }}>{pasttime > 0 ? <div>Timer:{pasttime}</div> : <div />}</div>;
  }, [pasttime]);
  const scoreDiv = useMemo(() => {
    return <div style={{ height: 30 }}>{pasttime > 0 ? <div>Score:</div> : <div />}</div>;
  }, []);
  const matchedDiv = useMemo(() => {
    return matched.map((m: { asset: number; quantity: number }) => (
      <div key={m.asset}>
        <span>{m.asset}</span>:<span>{m.quantity}</span>
      </div>
    ));
  }, [matched]);
  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "white" }}>
      {timerDiv}
      <div style={{ height: 15 }}></div>
      {scoreDiv}
      {matchedDiv}
    </div>
  );
};

export default GameConsole;

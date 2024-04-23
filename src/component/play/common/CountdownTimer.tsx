import React, { useEffect, useRef, useState } from "react";
import { useSceneManager } from "service/SceneManager";
import { useUserManager } from "service/UserManager";
import "./style.css";
interface CountdownTimerProps {
  battleStartTime: number;
  onTimeout: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ battleStartTime, onTimeout }) => {
  const countdownRef = useRef<HTMLDivElement | null>(null);
  const { visible } = useSceneManager();
  const [count, setCount] = useState<number>(-1);
  const { user } = useUserManager();
  useEffect(() => {
    const timeLeft = battleStartTime - user.timelag - Date.now();
    if (timeLeft > 0) setCount(Math.ceil(timeLeft / 1000));
    else setCount(0);
  }, [visible, battleStartTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((pre) => (pre && pre > 0 ? pre - 1 : pre));
    }, 1000);

    if (count === 0) {
      clearInterval(interval);
      if (onTimeout) {
        onTimeout();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [count, onTimeout]);

  return (
    <>
      <div className="countdown-timer" ref={countdownRef}>
        {count > 0 ? count : null}
        {count === 0 ? "Go" : null}
      </div>
    </>
  );
};

export default CountdownTimer;

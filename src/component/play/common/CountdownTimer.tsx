import React, { useEffect, useRef, useState } from "react";
import "./style.css";
interface CountdownTimerProps {
  countTime: number;
  onTimeout: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ countTime, onTimeout }) => {
  const countdownRef = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState<number>(-1);
  useEffect(() => {
    if (countTime > 0) setCount(Math.ceil(countTime / 1000));
  }, [countTime]);
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

import React, { useEffect, useRef, useState } from "react";
import "./style.css";
interface CountdownTimerProps {
  countTime: number;
  onTimeout: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ countTime, onTimeout }) => {
  const countdownRef = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState<number>(-2);

  useEffect(() => {
    if (count === -2) {
      setCount(Math.ceil((countTime - Date.now()) / 1000));
      return;
    }
    const interval = setInterval(() => {
      setCount((pre) => pre - 1);
    }, 1000);

    if (count === 0) {
      console.log("count complete");
      clearInterval(interval);
      if (onTimeout) {
        onTimeout();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countTime, count, onTimeout]);

  return (
    <>
      {count >= 0 ? (
        <div className="countdown-timer" ref={countdownRef}>
          {count > 0 ? count : "Go"}
        </div>
      ) : null}
    </>
  );
};

export default CountdownTimer;

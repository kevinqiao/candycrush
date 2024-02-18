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
    let interval: any;
    if (countTime > Date.now()) {
      interval = setInterval(() => {
        const time = countTime - Date.now();
        if (time > 0) {
          setCount(Math.round(time / 1000));
        } else {
          clearInterval(interval);
          if (onTimeout) {
            onTimeout();
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countTime, onTimeout]);

  return (
    <>
      {count >= 0 ? (
        <div className="countdown-timer" ref={countdownRef}>
          {count > 0 ? count : null}
          {count === 0 ? "Go" : null}
        </div>
      ) : null}
    </>
  );
};

export default CountdownTimer;

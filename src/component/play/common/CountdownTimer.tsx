import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import "./style.css"
interface CountdownTimerProps {
  seconds: number;
  onTimeout: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ seconds, onTimeout }) => {
  const countdownRef = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState<number>(seconds);

  useEffect(() => {
    const countdown = countdownRef.current;
    const tl = gsap.timeline({ repeat: 0 });
    tl.to(countdown, { scale: 1.1, duration: 0.5, ease: 'power2.inOut' });
    tl.to(countdown, { scale: 1, duration: 0.5, ease: 'power2.inOut' });

    const interval = setInterval(() => {
      if (count > 0) {
        setCount(count - 1);
      } else {
        clearInterval(interval);
        if (onTimeout) {
          onTimeout();
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [count, onTimeout]);

  return (
    <div className="countdown-timer" ref={countdownRef}>
      {count>0?count:"Go!"}
    </div>
  );
};

export default CountdownTimer;

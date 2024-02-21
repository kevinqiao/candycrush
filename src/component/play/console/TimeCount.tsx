import React, { useEffect, useState } from "react";
import { useUserManager } from "service/UserManager";
import { useBattleManager } from "../../../service/BattleManager";
import { useSceneManager } from "../../../service/SceneManager";

const TimeCount = () => {
  const { user } = useUserManager();
  const { containerBound } = useSceneManager();
  const { battle, createBattleEvent } = useBattleManager();
  const [timeLeft, setTimeLeft] = useState<number>(-1);

  useEffect(() => {
    if (!battle || !user) return;
    const past = (battle.startTime ?? 0) - Date.now() - user.timelag;
    if (past > 0)
      setTimeout(() => {
        setTimeLeft(Math.ceil(battle.duration / 1000));
      }, past);
    else if (battle.duration + past > 0) {
      setTimeLeft(Math.ceil((battle.duration + past) / 1000));
    } else createBattleEvent({ name: "battleOver", data: null });
  }, [battle, user]);

  useEffect(() => {
    if (timeLeft < 0) return;
    const timer = setInterval(() => {
      setTimeLeft((pre) => pre - 1);
    }, 1000);

    if (timeLeft === 0) {
      clearInterval(timer);
      createBattleEvent({ name: "battleOver", data: null });
    }
    // 清除计时器
    return () => clearInterval(timer);
  }, [timeLeft]); // 每次 timeLeft 更新时重新执行

  // 将剩余时间格式化为 HH:MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <>
      {containerBound ? (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 10,
            width: containerBound.width * 0.45,
            margin: 0,
            borderRadius: 0,
            backgroundColor: "blue",
          }}
        >
          <div>{timeLeft > 0 ? formatTime(timeLeft) : "00:00"}</div>
        </div>
      ) : null}
    </>
  );
};

export default TimeCount;

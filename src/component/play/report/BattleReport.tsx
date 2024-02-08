import { gsap } from "gsap";
import React, { useEffect, useMemo, useRef } from "react";
import { useBattleManager } from "service/BattleManager";
import { useSceneManager } from "service/SceneManager";
import { useUserManager } from "service/UserManager";

const BattleReport: React.FC = () => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const battleOverRef = useRef<HTMLDivElement | null>(null);
  const { battle, myGameOver, battleEvent } = useBattleManager();
  const { exit } = useSceneManager();
  const { user } = useUserManager();

  useEffect(() => {
    gsap.to(battleOverRef.current, { scale: 0, duration: 0 });
  }, []);

  useEffect(() => {
    if (myGameOver && battle?.load !== 2) setTimeout(() => openReport(), 2500);
  }, [myGameOver, battle]);
  const openReport = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 0.7, duration: 1.8 }).to(
      battleOverRef.current,
      { scale: 1, autoAlpha: 1, duration: 1.8 },
      "<"
    );
    tl.play();
  };
  const renderMyScore = useMemo(() => {
    if (battle) {
      const mygame = battle.games.find((g) => g.uid);
      if (mygame?.score) {
        const { base, time, goal } = mygame.score;
        return (
          <div>
            Base:{base} Time:{time} Goal:{goal}
          </div>
        );
      }
    }
    return null;
  }, [battleEvent, user]);

  const renderBattleReport = useMemo(() => {
    if (battle?.rewards) {
      return battle.rewards.map((r) => (
        <div key={r.uid}>
          {r.rank}
          {r.uid}
          {r.score}
          {JSON.stringify(r.assets)}
          {r.points}
        </div>
      ));
    } else {
      return battle?.games
        .sort((a, b) => {
          const scoreA = a.score ? a.score.base + a.score.time + a.score.goal : 0;
          const scoreB = b.score ? b.score.base + b.score.time + b.score.goal : 0;
          return scoreB - scoreA;
        })
        .map((g, index) => (
          <div key={g.gameId}>
            {"rank:" + index};{g.uid};{g.score ? g.score.base + g.score.time + g.score.goal : "is playing"}
          </div>
        ));
    }
  }, [battleEvent]);
  return (
    <>
      <div
        ref={maskRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          backgroundColor: "black",
          pointerEvents: "none",
        }}
      ></div>

      <div
        ref={battleOverRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          margin: 0,
          border: 0,
          opacity: 0,
          height: "100%",
        }}
      >
        <div
          style={{
            width: "70%",
            height: "50%",
            backgroundColor: "white",
          }}
          onClick={exit}
        >
          <div>{renderMyScore}</div>
          <div>{renderBattleReport}</div>
        </div>
      </div>
    </>
  );
};

export default BattleReport;

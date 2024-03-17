import { gsap } from "gsap";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useUserManager } from "service/UserManager";
import { useBattleManager } from "../../../service/BattleManager";
import useDimension from "../../../util/useDimension";

import { useAnimation } from "component/animation/battle/useAnimation";
import { useSearchMatch } from "component/animation/battle/useSearchMatch";
import Avatar from "../common/Avatar";
import CountdownTimer from "../common/CountdownTimer";
import "./search.css";
const timeLeft = (time: number) => {
  return time - Date.now();
};
const OpponentMatch = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const foundRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<HTMLDivElement | null>(null);
  const vsRef = useRef<HTMLDivElement | null>(null);
  const playerAvatarRef = useRef<HTMLDivElement | null>(null);
  const opponentAvatarRef = useRef<HTMLDivElement | null>(null);
  // const { scenes, stageScene } = useSceneManager();
  const { width, height } = useDimension(sceneContainerRef);
  // const [countTime, setCountTime] = useState(0);
  const { battle, allGameLoaded } = useBattleManager();
  const { user } = useUserManager();
  const { playMatching, playCloseMatching, closeSearch } = useSearchMatch();
  const { playInitBattle } = useAnimation();
  const countTime = battle && user ? timeLeft(battle.startTime - user.timelag) : 0;
  const eles = useCallback(() => {
    const es = new Map<string, HTMLDivElement>();
    if (sceneContainerRef.current) es.set("container", sceneContainerRef.current);
    if (foundRef.current) es.set("found", foundRef.current);
    if (startRef.current) es.set("start", startRef.current);
    if (vsRef.current) es.set("vs", vsRef.current);
    if (playerAvatarRef.current) es.set("playerAvatar", playerAvatarRef.current);
    if (opponentAvatarRef.current) es.set("opponentAvatar", opponentAvatarRef.current);
    return es;
  }, [
    sceneContainerRef.current,
    foundRef.current,
    startRef.current,
    vsRef.current,
    playerAvatarRef.current,
    opponentAvatarRef.current,
  ]);

  const player = useMemo(() => {
    if (battle?.games) {
      const game = battle.games.find((g) => g.uid === user.uid);
      if (game) return game.player;
    }
    return;
  }, [battle]);
  const opponent = useMemo(() => {
    if (battle?.games) {
      const game = battle.games.find((g) => g.uid !== user.uid);
      if (game) return game.player;
    }
    return;
  }, [battle]);
  const matchComplete = useCallback(() => {
    // console.log("matching completed,timeleft:" + countTime + ":" + allGameLoaded);

    if (!battle || !allGameLoaded || countTime < 0) return;
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    playCloseMatching(eles(), tl);
    const bl = gsap.timeline();
    tl.add(bl, ">");
    playInitBattle(battle, bl);
    tl.play();
  }, [battle, eles, allGameLoaded]);

  useEffect(() => {
    if (battle && battle.startTime && user && allGameLoaded) {
      // const time = battle.startTime - Date.now() - user.timelag;
      // const time = timeLeft(battle.startTime - user.timelag);
      // console.log("timeLeft:" + time);
      if (countTime > 0) {
        const tl = gsap.timeline({
          onComplete: () => {
            // setCountTime(battle.startTime - Date.now() - user.timelag);
            tl.kill();
          },
        });
        const sl = gsap.timeline({
          onComplete: () => {
            // const time = timeLeft(battle.startTime - user.timelag);
            // console.log("count time left:" + time);
            // setCountTime(time);
          },
        });
        tl.add(sl);

        closeSearch(sl);
        const ml = gsap.timeline();
        tl.add(ml, "<");
        playMatching(eles(), ml);
        tl.play();
      } else matchComplete();
    }
  }, [battle, user, allGameLoaded]);

  return (
    <>
      <div ref={sceneContainerRef} className="match_container">
        <div
          ref={playerAvatarRef}
          style={{
            opacity: 0,
            position: "absolute",
            top: height * 0.4,
            left: -80,
            width: 80,
            height: 80,
          }}
        >
          {player ? <Avatar player={player} /> : null}
        </div>
        <div
          ref={opponentAvatarRef}
          style={{
            opacity: 0,
            position: "absolute",
            top: height * 0.4,
            left: width,
            width: 80,
            height: 80,
          }}
        >
          {opponent ? <Avatar player={opponent} /> : null}
        </div>
        <div
          ref={vsRef}
          style={{
            opacity: 0,
            position: "absolute",
            top: height * 0.4 + 40,
            left: 0,
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <span style={{ fontSize: 20 }}>VS</span>
        </div>

        <div
          ref={foundRef}
          style={{
            opacity: 0,
            position: "absolute",
            top: height * 0.7,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 20 }}>Opponent Found</span>
        </div>
        <div
          ref={startRef}
          style={{
            opacity: 0,
            position: "absolute",
            top: height * 0.3,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "white",
          }}
        >
          <span style={{ fontSize: 20, color: "blue" }}>Start Game</span>
        </div>

        <div
          style={{
            position: "absolute",
            top: height * 0.3,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CountdownTimer countTime={countTime} onTimeout={matchComplete} />
        </div>
      </div>
    </>
  );
};

export default OpponentMatch;

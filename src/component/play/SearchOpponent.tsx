import { gsap } from "gsap";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useUserManager } from "service/UserManager";
import { useBattleManager } from "../../service/BattleManager";
import useDimension from "../../util/useDimension";
import { ANIMATE_EVENT_TYPE, ANIMATE_NAME } from "../animation/AnimateConstants";
import { useAnimateManager } from "../animation/AnimateManager";
import Avatar from "./common/Avatar";
import CountdownTimer from "./common/CountdownTimer";

const SearchOpponent = () => {
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const foundRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<HTMLDivElement | null>(null);
  const vsRef = useRef<HTMLDivElement | null>(null);
  const playerAvatarRef = useRef<HTMLDivElement | null>(null);
  const opponentAvatarRef = useRef<HTMLDivElement | null>(null);
  // const { scenes, stageScene } = useSceneManager();
  const { width, height } = useDimension(sceneContainerRef);
  const { createEvent } = useAnimateManager();
  const [countTime, setCountTime] = useState(0);
  // const [countSecond, setCountSecond] = useState(0);
  const { battle, allGameLoaded } = useBattleManager();
  const { user } = useUserManager();
  console.log(user);
  const playSearch = useCallback(() => {
    const tl = gsap.timeline({
      repeat: 4,
      yoyo: true,
      onComplete: () => {
        tl.kill();
      },
    });
    tl.fromTo(
      searchRef.current,
      { scaleX: 0.9, scaleY: 0.9 },
      { duration: 0.5, scaleX: 1.1, scaleY: 1.1, ease: "power2.inOut" }
    );
    tl.play();
  }, []);

  const closeSearchAndPlayFound = useCallback(() => {
    const ml = gsap.timeline({
      onComplete: () => {
        ml.kill();
      },
    });
    const tl = gsap.timeline({
      onComplete: () => {
        const dueTime = battle.startTime - user.timelag;
        setCountTime(dueTime);
        tl.kill();
      },
    });
    //close search, open success match
    ml.add(tl);
    tl.to(searchRef.current, { alpha: 0, duration: 0.1 });
    tl.to(foundRef.current, { alpha: 1, duration: 0.1 }, "<");
    tl.fromTo(vsRef.current, { scaleX: 0, scaleY: 0 }, { scaleX: 1.4, scaleY: 1.4, duration: 0.6 }, ">");
    tl.to(vsRef.current, { alpha: 1, duration: 0.8 }, "<");
    tl.to(playerAvatarRef.current, { duration: 1.2, alpha: 1, x: width * 0.35 }, "<");
    tl.to(opponentAvatarRef.current, { duration: 1.2, alpha: 1, x: -width * 0.35 }, "<");
    const sl = gsap.timeline();
    ml.add(sl, ">");
    sl.to(
      startRef.current,
      {
        duration: 0.3,
        autoAlpha: 1,
      },
      ">"
    );
    sl.to(startRef.current, { duration: 0.9, autoAlpha: 0 }, ">");
    ml.play();
  }, [width]);

  const playGame = useCallback((): void => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.call(() => {
      createEvent({ name: ANIMATE_NAME.BATTLE_INITED, type: ANIMATE_EVENT_TYPE.CREATE });
    }, []);
    tl.to(sceneContainerRef.current, { autoAlpha: 0, duration: 0.5 }, ">+=0.5");
    tl.play();
  }, []);
  useEffect(() => {
    if (battle && allGameLoaded) {
      console.log(battle);
      console.log(user);
      const time = battle.startTime ? battle.startTime - Date.now() - user.timelag : 0;
      console.log("time:" + time);
      if (time < 0) {
        console.log("playGame...");
        playGame();
        return;
      }
      gsap.to(sceneContainerRef.current, { autoAlpha: 1, duration: 0 });
      const searchTime = battle.searchDueTime - user.timelag - Date.now();
      if (searchTime > 0) {
        console.log("play searching....");
        playSearch();
        setTimeout(() => {
          closeSearchAndPlayFound();
        }, searchTime);
      }
    }
  }, [battle, allGameLoaded]);
  return (
    <>
      <div
        ref={sceneContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          color: "white",
          opacity: 0,
          backgroundColor: "red",
          pointerEvents: "none",
        }}
        onClick={() => {
          console.log("search layer...");
        }}
      >
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
          <Avatar />
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
          <Avatar />
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
          ref={searchRef}
          style={{
            position: "absolute",
            top: height * 0.6,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 20 }}>Searching...</span>
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
          <CountdownTimer countTime={countTime} onTimeout={playGame} />
        </div>
      </div>
    </>
  );
};

export default SearchOpponent;

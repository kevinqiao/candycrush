import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useUserManager } from "service/UserManager";
import { useBattleManager } from "../../service/BattleManager";
import useDimension from "../../util/useDimension";
import { ANIMATE_EVENT_TYPE, ANIMATE_NAME } from "../animation/AnimateConstants";
import { useAnimateManager } from "../animation/AnimateManager";
import Avatar from "./common/Avatar";
import CountdownTimer from "./common/CountdownTimer";

const SearchOpponent = () => {
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
  const [progress, setProgress] = useState(0);
  const [countTime, setCountTime] = useState(0);
  // const [countSecond, setCountSecond] = useState(0);
  const { battle, allGameLoaded } = useBattleManager();
  const { user } = useUserManager();
  useEffect(() => {
    if (battle && allGameLoaded && (battle.load === 2 || progress === 2)) {
      createEvent({ name: ANIMATE_NAME.BATTLE_INITED, type: ANIMATE_EVENT_TYPE.CREATE });
      startBattle();
    }
  }, [battle, allGameLoaded, progress]);
  useEffect(() => {
    if (user && battle && allGameLoaded) {
      if (progress === 0 && battle.load === 1) {
        const time = battle.startTime ? battle.startTime - Date.now() - user.timelag : 0;
        if (!battle.startTime || time <= 0) {
          setProgress(2);
          return;
        }
        const dueTime = battle.startTime - user.timelag;
        const tl = gsap.timeline({
          onComplete: () => {
            setCountTime(dueTime);
            tl.kill();
          },
        });

        tl.to(sceneContainerRef.current, { autoAlpha: 1, duration: 0 });
        tl.to(searchRef.current, { alpha: 0, duration: 0 }, "<");
        tl.to(foundRef.current, { alpha: 0, duration: 0 }, "<");
        // tl.to(vsRef.current, { scaleX: 1.4, scaleY: 1.4, duration: 0.1 }, ">");
        tl.to(vsRef.current, { alpha: 1, duration: 0.3 }, "<");
        tl.to(playerAvatarRef.current, { duration: 0, alpha: 1, x: width * 0.35 }, "<");
        tl.to(opponentAvatarRef.current, { duration: 0, alpha: 1, x: -width * 0.35 }, "<");

        tl.play();
      }
    }
  }, [battle, allGameLoaded, progress]);

  useEffect(() => {
    if (!battle || battle.load) return;
    const ml = gsap.timeline({
      onComplete: () => {
        setProgress(1);
        ml.kill();
      },
    });
    const bl = gsap.timeline({
      onComplete: () => {
        bl.kill();
      },
    });
    bl.to(sceneContainerRef.current, { autoAlpha: 1, duration: 0 });
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
    ml.add(bl).add(tl);
    ml.play();
  }, [battle]);

  useEffect(() => {
    if (user && battle && progress === 1) {
      const time = battle.startTime ? battle.startTime - Date.now() - user.timelag : 0;
      if (!battle.startTime || time <= 0) return;
      const dueTime = battle.startTime - user.timelag;
      const ml = gsap.timeline({
        onComplete: () => {
          ml.kill();
        },
      });
      const tl = gsap.timeline({
        onComplete: () => {
          tl.kill();
        },
      });
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
          onComplete: () => {
            setCountTime(dueTime);
          },
        },
        ">"
      );
      sl.to(startRef.current, { duration: 0.9, autoAlpha: 0 }, ">");
      ml.play();
    }
  }, [progress, battle]);

  // useEffect(() => {
  //   if (sceneContainerRef.current) {
  //     const scene = scenes.get(SCENE_NAME.BATTLE_MATCHING);
  //     if (!scene && width > 0 && height > 0) {
  //       const scene = {
  //         app: sceneContainerRef.current,
  //         x: 0,
  //         y: 0,
  //         width: width,
  //         height: height,
  //         type: 1,
  //         searchTxTEle: searchRef.current,
  //         vsEle: vsRef.current,
  //         foundTxTEle: foundRef.current,
  //         playerAvatarEle: playerAvatarRef.current,
  //         opponentAvatarEle: opponentAvatarRef.current,
  //       };
  //       stageScene(SCENE_NAME.BATTLE_MATCHING, scene);
  //     }
  //   }
  //   return () => {
  //     scenes.delete(SCENE_NAME.BATTLE_MATCHING);
  //   };
  // }, [sceneContainerRef, searchRef, vsRef, foundRef, scenes, width, height, stageScene]);

  const startBattle = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(sceneContainerRef.current, { autoAlpha: 0, duration: 0.5 });
    tl.play();
  };
  return (
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
        <CountdownTimer countTime={countTime} onTimeout={() => setProgress(2)} />
      </div>
    </div>
  );
};

export default SearchOpponent;

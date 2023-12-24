import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useBattleManager } from "service/BattleManager";
import { useSceneManager } from "service/SceneManager";

const BattleReport: React.FC = () => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const battleOverRef = useRef<HTMLDivElement | null>(null);
  const { battleOver } = useBattleManager();
  const { disableCloseBtn, exit } = useSceneManager();
  useEffect(() => {
    console.log(battleOver);
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    if (battleOver)
      tl.to(maskRef.current, { autoAlpha: 0.7, duration: 1.8 }).to(
        battleOverRef.current,
        { scale: 1, autoAlpha: 1, duration: 1.8 },
        "<"
      );
    else tl.to(battleOverRef.current, { scale: 0, duration: 0 });
    tl.play();
  }, [battleOver]);
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
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "70%",
            height: "50%",
            backgroundColor: "white",
          }}
          onClick={exit}
        >
          <div>
            <span>Battle Over</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BattleReport;

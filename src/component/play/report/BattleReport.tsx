import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useSceneManager } from "service/SceneManager";
import { useBattleManager } from "../../../service/BattleManager";

const BattleReport: React.FC = () => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const battleOverRef = useRef<HTMLDivElement | null>(null);
  const { event } = useBattleManager();
  const { disableCloseBtn, exit } = useSceneManager();

  useEffect(() => {
    if (!event || event.name !== "battleOver") return;
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 0.7, duration: 1.8 }).to(
      battleOverRef.current,
      { autoAlpha: 1, duration: 1.8 },
      "<"
    );
    tl.play();
  }, [event]);
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
          opacity: 0.7,
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
          opacity: 0.7,
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

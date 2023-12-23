import { gsap } from "gsap";
import { useEffect, useRef } from "react";

const PageCloseConfirm: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const confirmRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 0.7, duration: 0.5 }).fromTo(
      confirmRef.current,
      { scale: 0, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.5 },
      "<"
    );
    tl.play();
  }, []);
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
        ref={confirmRef}
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
        onClick={onConfirm}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "50%",
            height: "30%",
            backgroundColor: "white",
            borderRadius: 4,
          }}
        >
          <div>
            <span>Confirm</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageCloseConfirm;

import gsap from "gsap";
import React, { ReactNode, useEffect, useRef } from "react";
import { usePageManager } from "../service/PageManager";
import useStackAnimation from "./StackAnimation";
import "./popup.css";
interface PopupProps {
  zIndex: number;
  page: string;
  position: { top: number; left: number; width: number; height: number; direction: number };
  children: ReactNode;
}

const StackPop: React.FC<PopupProps> = ({ zIndex, page, position, children }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLDivElement>(null);
  const StackAnimation = useStackAnimation({
    scene: popupRef,
    mask: maskRef,
    closeBtn: closeBtnRef,
    position,
  });

  const { popPage } = usePageManager();

  useEffect(() => {
    StackAnimation.play();
  }, []);

  const togglePopup = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        popPage([page]);
        tl.kill();
      },
    });
    StackAnimation.close(tl);
  };

  return (
    <>
      <div ref={maskRef} className="mask" style={{ zIndex, opacity: 0 }}></div>
      <div
        className="popup"
        ref={popupRef}
        style={{
          margin: 0,
          border: 0,
          top: position?.top,
          left: position?.left,
          width: position?.width,
          height: position?.height,
          zIndex: zIndex + 1,
          backgroundColor: "transparent",
        }}
      >
        <div
          ref={closeBtnRef}
          className="closePopBtn"
          style={{ opacity: 0 }}
          onClick={() => {
            togglePopup();
          }}
        >
          Cancel
        </div>
        {children}
      </div>
    </>
  );
};

export default StackPop;

import React, { ReactNode, useEffect, useRef } from "react";
import useEventSubscriber from "../service/EventManager";
import { PageItem, usePageManager } from "../service/PageManager";
import { useUserManager } from "../service/UserManager";
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
  const StackAnimation = useStackAnimation({
    scene: popupRef,
    mask: maskRef,
    position,
  });
  const { user } = useUserManager();
  const { stacks, openPage, popPage } = usePageManager();
  const { event } = useEventSubscriber(["closePage", "closeAllPop"], []);
  useEffect(() => {
    if (event?.name === "closeAllPop" || event?.data.name === page) {
      togglePopup();
    }
  }, [event]);
  useEffect(() => {
    if (user && page === "signin") togglePopup();
  }, [user]);

  useEffect(() => {
    StackAnimation.play();
  }, []);

  const togglePopup = () => {
    StackAnimation.stop();
    if (position) {
      if (page === "signin") {
        const spage = stacks.find((s: PageItem) => s.name === "signin");
        if (spage) {
          setTimeout(() => popPage(["signin"]), 700);
          setTimeout(() => openPage(spage.data), 850);
        }
      } else setTimeout(() => popPage([page]), 800);
    }
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
          opacity: 0,
        }}
      >
        {children}
        <div
          className="closePopBtn"
          onClick={() => {
            togglePopup();
          }}
        >
          Cancel
        </div>
      </div>
    </>
  );
};

export default StackPop;

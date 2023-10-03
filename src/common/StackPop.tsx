import React, { useEffect, useRef } from "react";
import useEventSubscriber from "../service/EventManager";
import { PageItem, usePageManager } from "../service/PageManager";
import { useUserManager } from "../service/UserManager";
import useStackAnimation from "./StackAnimation";
import "./popup.css";
interface PopupProps {
  zIndex: number;
  page: string;
  position: { page: string; top: number; left: number; width: number; height: number; direction: number } | null;
  render: (togglePopup: () => void) => React.ReactNode;
}

const StackPop: React.FC<PopupProps> = ({ zIndex, position, render }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const StackAnimation = useStackAnimation({
    scene: popupRef,
    mask: maskRef,
    position,
  });
  const { user } = useUserManager();
  const { stacks, openPage, popPage } = usePageManager();
  const { event } = useEventSubscriber(["closePage"], []);
  useEffect(() => {
    if (event?.data.name === position?.page) {
      togglePopup();
    }
  }, [event]);
  useEffect(() => {
    if (user && position?.page === "signin") togglePopup();
  }, [user]);

  useEffect(() => {
    StackAnimation.play();
  }, []);
  const togglePopup = () => {
    StackAnimation.stop();
    if (position) {
      if (position.page === "signin") {
        const spage = stacks.find((s: PageItem) => s.name === "signin");
        if (spage) {
          setTimeout(() => popPage(["signin"]), 700);
          setTimeout(() => openPage(spage.data), 850);
        }
      } else setTimeout(() => popPage([position.page]), 800);
    }
  };

  return (
    <>
      <div ref={maskRef} className="mask" style={{ zIndex, opacity: 0 }}></div>

      <div
        className="popup"
        ref={popupRef}
        style={{
          top: position?.top,
          left: position?.left,
          width: position?.width,
          height: position?.height,
          zIndex: zIndex + 1,
          opacity: 0,
        }}
      >
        {render(togglePopup)}
      </div>
    </>
  );
};

export default StackPop;

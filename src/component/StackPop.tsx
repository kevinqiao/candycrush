import gsap from "gsap";
import React, { FunctionComponent, Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import PageProps from "../model/PageProps";
import { usePageManager } from "../service/PageManager";
import useStackAnimation from "./animation/page/StackAnimation";
import PageCloseConfirm from "./common/PageCloseConfirm";
import "./popup.css";
interface PopupProps {
  zIndex: number;
  pageProp: PageProps | null;
}
export const CLOSE_TYPE = {
  NO_BUTTON: 0,
  WITH_BUTTON: 1,
  NEED_CONFIRM: 2,
};
const StackPop: React.FC<PopupProps> = ({ zIndex, pageProp }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLDivElement>(null);
  const { popPage } = usePageManager();
  const [openConfirm, setOpenConfirm] = useState(false);
  const StackAnimation = useStackAnimation({
    scene: popupRef,
    mask: maskRef,
    closeBtn: closeBtnRef,
    pageProp,
  });

  useEffect(() => {
    StackAnimation.play();
  }, []);

  const close = () => {
    if (pageProp?.config?.closeType === 2 && !openConfirm) {
      setOpenConfirm(true);
      return;
    }
    const tl = gsap.timeline({
      onComplete: () => {
        if (pageProp) popPage([pageProp.name]);
        tl.kill();
      },
    });
    StackAnimation.close(tl);
  };
  const disableCloseBtn = useCallback(() => {
    if (closeBtnRef.current) {
      console.log("call close button");
      gsap.to(closeBtnRef.current, { autoAlpha: 0, duration: 0.3 });
    }
  }, []);
  const exit = useCallback(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (pageProp) popPage([pageProp.name]);
        tl.kill();
      },
    });
    StackAnimation.close(tl);
  }, []);
  const render = useCallback(() => {
    if (pageProp) {
      const SelectedComponent: FunctionComponent<PageProps> = lazy(() => import(`${pageProp.config.uri}`));
      const prop = Object.assign({}, pageProp, { disableCloseBtn, exit });
      return (
        <Suspense fallback={<div>Loading</div>}>
          <SelectedComponent {...prop} />
        </Suspense>
      );
    }
  }, [pageProp]);
  return (
    <>
      <div ref={maskRef} className="mask" style={{ zIndex, opacity: 0 }}></div>
      <div
        className="popup"
        ref={popupRef}
        style={{
          margin: 0,
          border: 0,
          top: pageProp?.position?.top,
          left: pageProp?.position?.left,
          width: pageProp?.position?.width,
          height: pageProp?.position?.height,
          zIndex: zIndex + 1,
          backgroundColor: "transparent",
        }}
      >
        {render()}
        <div ref={closeBtnRef} className="closePopBtn" style={{ opacity: 0 }} onClick={close}>
          Cancel
        </div>
        {openConfirm ? (
          <div className="closeConfirm">
            <PageCloseConfirm onConfirm={close} />
          </div>
        ) : null}
      </div>
    </>
  );
};

export default StackPop;

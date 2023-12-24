import gsap from "gsap";
import React, { FunctionComponent, Suspense, lazy, useCallback, useEffect, useRef } from "react";
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
  const closeMaskRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLDivElement>(null);
  const { popPage } = usePageManager();
  const StackAnimation = useStackAnimation({
    scene: popupRef,
    mask: maskRef,
    closeBtn: closeBtnRef,
    pageProp,
  });

  useEffect(() => {
    StackAnimation.play();
    gsap.to(closeMaskRef.current, { pointerEvents: "none", autoAlpha: 0, duration: 0 });
    gsap.to(confirmRef.current, { scale: 0, autoAlpha: 0, duration: 0 });
  }, []);

  const close = useCallback(() => {
    if (pageProp?.config?.closeType === 2) {
      const tl = gsap.timeline();
      tl.to(closeMaskRef.current, { autoAlpha: 0.6, duration: 0.7 }).to(
        confirmRef.current,
        { scale: 1, autoAlpha: 1, duration: 0.7 },
        "<"
      );
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          if (pageProp) popPage([pageProp.name]);
          tl.kill();
        },
      });
      StackAnimation.close(tl);
    }
  }, [StackAnimation, pageProp, popPage]);
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
  }, [pageProp]);

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

        <div
          className="popup"
          ref={closeMaskRef}
          style={{
            margin: 0,
            border: 0,
            top: pageProp?.position?.top,
            left: pageProp?.position?.left,
            width: pageProp?.position?.width,
            height: pageProp?.position?.height,
            zIndex: zIndex + 2,
            opacity: 0,
            backgroundColor: "black",
          }}
        ></div>
        <div
          className="popup"
          ref={confirmRef}
          style={{
            margin: 0,
            border: 0,
            top: pageProp?.position?.height ? pageProp?.position?.height * 0.25 : 0,
            left: pageProp?.position?.width ? pageProp?.position?.width * 0.2 : 0,
            width: pageProp?.position?.width ? pageProp?.position?.width * 0.6 : 0,
            height: pageProp?.position?.height ? pageProp?.position?.height * 0.5 : 0,
            zIndex: zIndex + 3,
            opacity: 0,
            backgroundColor: "white",
          }}
        >
          <PageCloseConfirm onConfirm={exit} />
        </div>
      </div>
    </>
  );
};

export default StackPop;

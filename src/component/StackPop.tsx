import gsap from "gsap";
import { StackPages } from "model/PageCfg";
import PageProps, { PagePattern } from "model/PageProps";
import React, { FunctionComponent, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useCoord from "service/CoordManager";
import { usePageManager } from "service/PageManager";
import useStackAnimation from "./animation/page/StackAnimation";
import PageCloseConfirm from "./common/PageCloseConfirm";
import "./popup.css";
interface PopupProps {
  index: number;
  zIndex: number;
  // page: PageItem;
  // pageProp: PageProps | null;
}
export const CLOSE_TYPE = {
  NO_BUTTON: 0,
  WITH_BUTTON: 1,
  NEED_CONFIRM: 2,
};
const StackPop: React.FC<PopupProps> = ({ zIndex, index }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const closeMaskRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLDivElement>(null);
  // const [openCompleted, setOpenCompleted] = useState(false);
  // const [page, setPage] = useState<PageItem | null>(null);
  const [pageProp, setPageProp] = useState<PageProps | null>(null);
  const { width, height } = useCoord();
  const { stacks, popPage } = usePageManager();

  const pagePattern: PagePattern | undefined = useMemo(() => {
    if (pageProp) {
      const pageCfg = pageProp.config;
      const w = pageCfg.width <= 1 ? width * pageCfg.width : pageCfg.width;
      const h = pageCfg.height <= 1 ? height * pageCfg.height : pageCfg.height;
      return { width: w, height: h, direction: pageCfg.direction };
    }
  }, [pageProp, width, height]);

  const StackAnimation = useStackAnimation({
    scene: popupRef,
    mask: maskRef,
    closeBtn: closeBtnRef,
    pageProp,
    pagePattern,
  });
  useEffect(() => {
    if (stacks[index] && !pageProp) {
      const pageCfg = StackPages.find((s) => s.name === stacks[index].name);
      if (pageCfg) {
        const prop = { name: stacks[index].name, data: stacks[index].data, config: pageCfg };
        setPageProp(prop);
      }
    }
  }, [index, pageProp, stacks]);

  useEffect(() => {
    if (!pageProp) return;
    StackAnimation.play(null);
    gsap.to(closeMaskRef.current, { pointerEvents: "none", autoAlpha: 0, duration: 0 });
    gsap.to(confirmRef.current, { scale: 0, autoAlpha: 0, duration: 0 });
  }, [pageProp]);

  const close = useCallback(() => {
    if (pageProp?.config?.closeType === 2) {
      const tl = gsap.timeline({
        onComplete: () => {
          tl.kill();
        },
      });
      tl.to(closeMaskRef.current, { autoAlpha: 0.6, duration: 0.7 }).to(
        confirmRef.current,
        { scale: 1, autoAlpha: 1, duration: 0.7 },
        "<"
      );
      tl.play();
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          if (pageProp) popPage([pageProp.name]);
          setPageProp(null);
          tl.kill();
        },
      });
      StackAnimation.close(tl);
    }
  }, [pageProp, StackAnimation, popPage]);

  const disableCloseBtn = useCallback(() => {
    if (closeBtnRef.current) {
      gsap.to(closeBtnRef.current, { autoAlpha: 0, duration: 0.3 });
    }
  }, []);
  const exit = useCallback(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (pageProp) popPage([pageProp.name]);
        setPageProp(null);
        tl.kill();
      },
    });
    StackAnimation.close(tl);
  }, [pageProp]);

  const renderComponent = useMemo(() => {
    if (pageProp) {
      const SelectedComponent: FunctionComponent<PageProps> = lazy(() => import(`${pageProp.config.uri}`));
      const prop = Object.assign({}, pageProp, { disableCloseBtn, exit });
      return (
        <Suspense fallback={<div></div>}>
          <SelectedComponent {...prop} />
        </Suspense>
      );
    }
  }, [pageProp]);

  return (
    <>
      <div
        ref={maskRef}
        className="mask"
        style={{ zIndex, opacity: 0, width: pagePattern ? "100vw" : 0, height: pagePattern ? "100vh" : 0 }}
      ></div>

      <div
        ref={popupRef}
        style={{
          position: "absolute",
          borderColor: "black",
          // top: pageProp?.position?.top,
          top: 0,
          left: 0,
          // left: pageProp?.position?.left,
          width: pagePattern ? pagePattern.width : 0,
          height: pagePattern ? pagePattern.height : 0,
          zIndex: zIndex + 10,
          backgroundColor: "transparent",
        }}
      >
        {renderComponent}

        <div
          ref={closeMaskRef}
          style={{
            position: "absolute",
            margin: 0,
            border: 0,
            top: 0,
            left: 0,
            width: pagePattern?.width,
            height: pagePattern?.height,
            zIndex: zIndex + 20,
            opacity: 0,
            backgroundColor: "black",
          }}
        ></div>
        <div
          ref={confirmRef}
          style={{
            position: "absolute",
            margin: 0,
            top: pagePattern ? pagePattern.height * 0.25 : 0,
            left: pagePattern ? pagePattern.width * 0.2 : 0,
            width: pagePattern ? pagePattern.width * 0.6 : 0,
            height: pagePattern ? pagePattern.height * 0.5 : 0,
            zIndex: zIndex + 30,
            opacity: 0,
            backgroundColor: "white",
          }}
        >
          <PageCloseConfirm onConfirm={exit} />
        </div>
        <div
          ref={closeBtnRef}
          className="closeStackBtn"
          style={{ zIndex: zIndex + 50, borderRadius: "4px 10px 0px 0px", opacity: 0 }}
          onClick={close}
        >
          Cancel({index})
        </div>
      </div>
    </>
  );
};

export default StackPop;

import gsap from "gsap";
import { StackPages } from "model/PageCfg";
import PageProps from "model/PageProps";
import React, { FunctionComponent, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useCoord from "service/CoordManager";
import { PageItem, usePageManager } from "service/PageManager";
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
  const [page, setPage] = useState<PageItem | null>(null);
  const [pageProp, setPageProp] = useState<PageProps | null>(null);
  const { width, height } = useCoord();
  const { stacks, popPage } = usePageManager();
  const StackAnimation = useStackAnimation({
    scene: popupRef,
    mask: maskRef,
    closeBtn: closeBtnRef,
    pageProp,
  });

  useEffect(() => {
    if (stacks && index < stacks.length) {
      setPage(stacks[index]);
    } else {
      // gsap.to(closeMaskRef.current, { pointerEvents: "none", autoAlpha: 0, duration: 0 });
      setPage(null);
    }
  }, [index, stacks]);

  useEffect(() => {
    if (page) {
      const pageCfg = StackPages.find((s) => s.name === page.name);
      if (pageCfg) {
        const w = pageCfg.width <= 1 ? width * pageCfg.width : pageCfg.width;
        const h = pageCfg.height <= 1 ? height * pageCfg.height : pageCfg.height;
        const position = { width: w, height: h, direction: pageCfg.direction };
        const prop = { name: page.name, position, data: page.data, config: pageCfg };
        console.log(prop);
        setPageProp(prop);
      }
    }
  }, [page]);

  useEffect(() => {
    if (!pageProp) return;
    StackAnimation.play();
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
  }, [pageProp, stacks, popPage]);

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
  // console.log("stackpop at index:" + index);
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
  }, [pageProp, stacks]);

  return (
    <>
      <div
        ref={maskRef}
        className="mask"
        style={{ zIndex, opacity: 0, width: pageProp ? "100vw" : 0, height: pageProp ? "100vh" : 0 }}
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
          width: pageProp ? pageProp.position?.width : 0,
          height: pageProp ? pageProp.position?.height : 0,
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
            width: pageProp?.position?.width,
            height: pageProp?.position?.height,
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
            top: pageProp?.position?.height ? pageProp?.position?.height * 0.25 : 0,
            left: pageProp?.position?.width ? pageProp?.position?.width * 0.2 : 0,
            width: pageProp?.position?.width ? pageProp?.position?.width * 0.6 : 0,
            height: pageProp?.position?.height ? pageProp?.position?.height * 0.5 : 0,
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
          style={{ borderRadius: "4px 10px 0px 0px", opacity: 0 }}
          onClick={close}
        >
          Cancel({index})
        </div>
      </div>
    </>
  );
};

export default StackPop;

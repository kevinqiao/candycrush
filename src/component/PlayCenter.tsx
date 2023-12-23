import gsap from "gsap";
import React, { FunctionComponent, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { NavPages } from "../model/PageCfg";
import useCoord from "../service/CoordManager";
import useEventSubscriber from "../service/EventManager";
import { usePageManager } from "../service/PageManager";
import "./layout.css";
import PlayMenu from "./menu/PlayMenu";

const colors = ["red", "green", "blue", "orange", "white"];
const pageIndexs = [
  { name: "tournamentHome", index: 0 },
  { name: "textureList", index: 1 },
  { name: "goalPanel", index: 2 },
  { name: "accountHome", index: 3 },
  { name: "avatarList", index: 4 },
];

const PlayCenter: React.FC = () => {
  const indexRef = useRef<number>(2);
  const [pages, setPages] = useState<{ name: string; index: number; component: any }[]>([]);
  const { currentPage, openPage } = usePageManager();
  const { createEvent } = useEventSubscriber([], []);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useCoord();
  console.log(width);
  useEffect(() => {
    const ps: { name: string; index: number; component: any }[] = [];
    for (let p of pageIndexs) {
      const page = NavPages.find((n) => n.name === p.name);
      // console.log(page);
      if (page) {
        const c = lazy(() => import(`${page.uri}`));
        ps.push({ name: p.name, index: p.index, component: React.memo(c) });
      }
    }
    if (ps !== undefined && ps?.length > 0) {
      setPages(ps);
    }
  }, []);
  useEffect(() => {
    if (mainRef.current != null && pages?.length > 0) {
      const tl = gsap.timeline();
      tl.to(mainRef.current, { duration: 0.1, autoAlpha: 0, x: -2 * width });
      tl.to(mainRef.current, { duration: 1, autoAlpha: 1, ease: "back.out(1.0)" });
    }
  }, [mainRef.current, pages, width]);

  useEffect(() => {
    const swipeArea = mainRef.current;
    if (!swipeArea) return;

    let startX: number | null = null;

    const start = (event: TouchEvent | MouseEvent) => {
      const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
      startX = clientX;
    };

    const end = (event: TouchEvent | MouseEvent) => {
      if (startX === null) return;
      const clientX = "changedTouches" in event ? event.changedTouches[0].clientX : event.clientX;
      const diffX = startX - clientX;

      if (Math.abs(diffX) > 50) {
        let index = indexRef.current;
        if (diffX > 0 && indexRef.current < 4) {
          index++;
        } else if (diffX < 0 && indexRef.current > 0) {
          index--;
        }
        if (index !== indexRef.current) {
          const page = pages?.find((p: any) => p.index === index);
          if (page) {
            // openPage({ name: page.name, data: {} });
            createEvent({ name: "openPage", data: { name: page.name, data: {} }, delay: 10 });
          }
        }
      }
      startX = null;
    };
    if (swipeArea) {
      swipeArea.addEventListener("touchstart", start);
      swipeArea.addEventListener("touchend", end);
    }
    return () => {
      swipeArea.removeEventListener("touchstart", start as any);
      swipeArea.removeEventListener("touchend", end as any);
    };
  }, [pages]);

  useEffect(() => {
    if (currentPage && !currentPage.isInitial) {
      const page = pages?.find((p: any) => p.name === currentPage.name);
      if (page) {
        indexRef.current = page.index;
        gsap.to(mainRef.current, { duration: 1.4, autoAlpha: 1, x: -page.index * width });
      }
    }
  }, [currentPage, pages]);

  const renderPage = useMemo(() => {
    const elems = [];
    if (pages?.length > 0)
      for (let i = 0; i < 5; i++) {
        const page = pages?.find((p: any) => p.index === i);
        if (page) {
          if (page.component) {
            const SelectedComponent: FunctionComponent = page.component;
            elems.push(
              <div
                key={page.name}
                style={{
                  width: width,
                  height: "100%",
                  padding: "0px",
                  backgroundColor: colors[i],
                }}
              >
                <Suspense fallback={<div>Loading...</div>}>
                  <SelectedComponent />
                </Suspense>
              </div>
            );
          }
        }
      }
    return elems;
  }, [pages, width]);

  return (
    <>
      <PlayMenu />
      <div id="main-home" key={"main-home"} ref={mainRef} style={{ opacity: 0 }}>
        <div
          id="main-content"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: 5 * width,
            height: "100vh",
          }}
        >
          {renderPage}
        </div>
      </div>
    </>
  );
};

export default PlayCenter;

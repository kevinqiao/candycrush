import { gsap } from "gsap";

import { FunctionComponent, Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { NavPages } from "../model/PageCfg";
import useCoord from "../service/CoordManager";
import { usePageManager } from "../service/PageManager";
import "./layout.css";
import MainMenu from "./menu/MainMenu";

const colors = ["red", "green", "blue", "orange", "white"];
const getIndex = (name: string) => {
  let index = 0;
  switch (name) {
    case "playHome":
      index = 1;
      break;
    case "tournamentHome":
      index = 0;
      break;
    default:
      break;
  }
  return index;
};
const NavController: React.FC = () => {
  const indexRef = useRef<number>(0);
  const [pages, setPages] = useState<{ name: string; index: number; component: any }[]>();
  const { currentPage, openPage } = usePageManager();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useCoord();
  useEffect(() => {
    const pages = NavPages.map((p) => {
      const c = lazy(() => import(`${p.uri}`));
      return { name: p.name, index: getIndex(p.name), component: c };
    });
    if (pages?.length > 0) {
      setPages(pages);
      openPage({ name: pages[0].name, data: {} });
    }
  }, []);
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
        if (diffX > 0 && indexRef.current < 4) {
          indexRef.current = indexRef.current + 1;
        } else if (diffX < 0 && indexRef.current > 0) {
          indexRef.current = indexRef.current - 1;
        }
        const page = pages?.find((p) => p.index === indexRef.current);
        if (page) openPage({ name: page.name, data: {} });
        else {
          openPage({ name: "test", data: {} });
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
  }, []);

  useEffect(() => {
    if (currentPage) {
      // const page = pages?.find((p) => p.name === currentPage.name);
      gsap.to(mainRef.current, { duration: 0.9, x: -indexRef.current * width });
      // if (page) gsap.to(mainRef.current, { duration: 0.9, x: -page.index * width });
      // else gsap.to(mainRef.current, { duration: 0.9, x: -indexRef.current * width });
    }
  }, [width, currentPage]);

  const renderPage = useCallback(
    (index: number) => {
      const page = pages?.find((p) => p.index === index);
      if (page) {
        const SelectedComponent: FunctionComponent = page.component;
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <SelectedComponent />
          </Suspense>
        );
      }
    },
    [pages]
  );
  const changeMenu = (index: number) => {
    indexRef.current = index;
    const page = pages?.find((p) => p.index === index);
    if (page) {
      // indexRef.current = index;
      openPage({ name: page.name, data: {} });
    } else {
      // gsap.to(mainRef.current, { duration: 0.9, x: -index * width });
      openPage({ name: "test", data: {} });
    }
  };
  return (
    <>
      <MainMenu currentIndex={indexRef.current} onChange={changeMenu} />
      <div
        id="main-home"
        ref={mainRef}
        style={{ display: "flex", justifyContent: "flex-start", width: 5 * width, height: "100vh" }}
      >
        {Array.from({ length: 5 }, (_, k) => k).map((p, index) => (
          <div
            key={index + "00"}
            style={{
              width: width,
              height: "100%",
              padding: "0px",
              backgroundColor: colors[index],
            }}
          >
            {renderPage(p)}
          </div>
        ))}
      </div>
    </>
  );
};

export default NavController;

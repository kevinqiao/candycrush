import gsap from "gsap";
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
    case "battleHome":
      index = 2;
      break;
    case "playHome":
      index = 1;
      break;
    case "tournamentHome":
      index = 0;
      break;
    case "accountHome":
      index = 3;
      break;
    default:
      break;
  }
  return index;
};
const NavController: React.FC = () => {
  // const indexRef = useRef<number>(2);
  const [pages, setPages] = useState<{ name: string; index: number; component: any }[]>([]);
  const { currentPage, openPage } = usePageManager();
  const mainRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useCoord();
  useEffect(() => {
    const ps = NavPages.map((p) => {
      const c = lazy(() => import(`${p.uri}`));
      return { name: p.name, index: getIndex(p.name), component: c };
    });
    if (ps?.length > 0) {
      setPages(ps);
    }
  }, []);
  useEffect(() => {
    if (mainRef.current != null && pages?.length > 0) {
      const tl = gsap.timeline();
      tl.to(mainRef.current, { duration: 0.1, autoAlpha: 0, x: -2 * width });
      tl.to(mainRef.current, { duration: 2, autoAlpha: 1, ease: "back.out(1.2)" });
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
        let index = currentIndex();
        if (diffX > 0 && index < 4) {
          index++;
        } else if (diffX < 0 && index > 0) {
          index--;
        }
        const page = pages?.find((p) => p.index === index);
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
    if (currentPage && !currentPage.initial) {
      const page = pages?.find((p) => p.name === currentPage.name);
      console.log(page?.index);
      if (page) {
        gsap.to(mainRef.current, { duration: 1, autoAlpha: 1, x: -page.index * width });
      }
    }
  }, [currentPage, pages]);
  const currentIndex = () => {
    if (currentPage && pages) {
      const page = pages.find((p) => p.name === currentPage.name);
      return page ? page.index : 2;
    }
    return 2;
  };

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
    // indexRef.current = index;
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
      <MainMenu currentIndex={currentIndex()} onChange={changeMenu} />
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
      </div>
    </>
  );
};

export default NavController;

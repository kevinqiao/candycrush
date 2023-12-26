import gsap from "gsap";
import PageProps from "model/PageProps";
import React, { FunctionComponent, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import useCoord from "../service/CoordManager";
import { NavAnimateProvider, useNavAnimateManager } from "./NavAnimateManager";

import "./layout.css";
import PlayMenu from "./menu/PlayMenu";

const colors = ["red", "green", "blue", "orange", "white"];
const PlayCenter: React.FC<PageProps> = ({ ...pageProp }) => {
  const {index,components,slideContainer,loadSlideContainer,loadSlide,changeIndex} = useNavAnimateManager();
  const { width, height } = useCoord();

  // useEffect(() => {
  //   if (mainRef.current != null && pages?.length > 0) {
  //     const tl = gsap.timeline();
  //     tl.to(mainRef.current, { duration: 0.1, autoAlpha: 0, x: -2 * width });
  //     tl.to(mainRef.current, { duration: 1, autoAlpha: 1, ease: "back.out(1.0)" });
  //   }
  // }, [mainRef.current, pages, width]);

  useEffect(() => {
    const swipeArea = slideContainer;
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
      
        if (diffX > 0 && index < 4) {
            changeIndex(index+1)
        } else if (diffX < 0 && index > 0) {
            changeIndex(index-1)
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
  }, [components]);
 console.log(components)
  


  return (
   <>
      <PlayMenu/>
      <div id="main-home" key={"main-home"} ref={loadSlideContainer}>
        <div
          id="main-content"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            width: 5 * width,
            height: "100vh",
          }}
        >
         {components.map((c)=>{
          const SelectedComponent: FunctionComponent= c.component;
            return (<div
                key={c.name}
                ref={(ele)=>loadSlide(c.index,ele)}
                style={{
                  width: width,
                  height: "100%",
                  padding: "0px",
                  backgroundColor: colors[c.index],
                }}
              >
                <Suspense fallback={<div>Loading...</div>}>
                 <SelectedComponent/>
                </Suspense>
              </div>)}
            )};
        </div>
      </div>
      </>
  );
};

export default PlayCenter;

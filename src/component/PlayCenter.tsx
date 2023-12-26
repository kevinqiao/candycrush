import gsap from "gsap";
import PageProps from "model/PageProps";
import React, { FunctionComponent, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import useCoord from "../service/CoordManager";
import { useNavAnimateManager } from "./NavAnimateManager";
import "./layout.css";
import PlayMenu from "./menu/PlayMenu";

const colors = ["red", "green", "blue", "orange", "white"];
const PlayCenter: React.FC<PageProps> = ({ ...pageProp }) => {
  const {components,loadSlideContainer,loadSlide} = useNavAnimateManager();
  const { width, height } = useCoord();

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

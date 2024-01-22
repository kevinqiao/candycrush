import React, { FunctionComponent, Suspense, useMemo } from "react";
import useCoord from "service/CoordManager";
import { useSlideNavManager } from "./SlideNavManager";
import "./layout.css";
import PlayMenu from "./menu/PlayMenu";

const colors = ["red", "green", "blue", "orange", "grey"];
const SlidPlayer: React.FC = () => {
  const { components, loadSlideContainer, loadSlide } = useSlideNavManager();
  const { width } = useCoord();

  const render = useMemo(() => {
    return (
      <>
        <PlayMenu />
        <div id="main-home" key={"main-home"} ref={loadSlideContainer} style={{ backgroundColor: "transparent" }}>
          <div
            id="main-content"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              width: 5 * width,
              height: "100vh",
              backgroundColor: "transparent",
            }}
          >
            {components.map((c) => {
              if (c.component) {
                const SelectedComponent: FunctionComponent = c.component;
                return (
                  <div
                    key={c.name}
                    ref={(ele) => loadSlide(c.index, ele)}
                    style={{
                      width: "100vw",
                      height: "100%",
                      margin: "0px",
                      padding: "0px",
                      backgroundColor: "transparent",
                    }}
                  >
                    <Suspense fallback={<div>Loading...</div>}>
                      <SelectedComponent />
                    </Suspense>
                  </div>
                );
              } else
                return (
                  <div
                    key={c.name}
                    ref={(ele) => loadSlide(c.index, ele)}
                    style={{
                      width: "100vw",
                      height: "100%",
                      margin: "0px",
                      padding: "0px",
                      backgroundColor: colors[c.index],
                    }}
                  ></div>
                );
            })}
          </div>
        </div>
      </>
    );
  }, [loadSlideContainer, width, components, loadSlide]);
  return <>{render}</>;
};

export default SlidPlayer;

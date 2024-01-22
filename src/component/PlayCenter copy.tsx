import PageProps from "model/PageProps";
import React, { FunctionComponent, Suspense, useEffect, useMemo } from "react";
import useCoord from "service/CoordManager";
import { usePageManager } from "service/PageManager";
import { useUserManager } from "service/UserManager";
import { useSlideNavManager } from "./SlideNavManager";
import "./layout.css";
import PlayMenu from "./menu/PlayMenu";

const colors = ["red", "green", "blue", "orange", "grey"];
const PlayCenter: React.FC<PageProps> = (prop) => {
  const { components, loadSlideContainer, loadSlide } = useSlideNavManager();
  const { stacks, openPage } = usePageManager();
  const { userEvent } = useUserManager();
  const { width } = useCoord();

  useEffect(() => {
    if (userEvent) {
      const p = stacks.find((s) => s.name === "battlePlay");
      if (!p) openPage({ name: "battlePlay", ctx: "playplace", data: { act: "load", battle: userEvent?.data } });
    }
  }, [stacks, userEvent]);
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

export default PlayCenter;

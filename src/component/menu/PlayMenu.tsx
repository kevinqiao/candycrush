import { useSlideNavManager } from "component/SlideNavManager";
import React from "react";
import useCoord from "../../service/CoordManager";
import "./menu.css";

const PlayMenu: React.FC = () => {
  const coord = useCoord();
  const { pageProp, loadMenu, changeIndex } = useSlideNavManager();
  const openChild = (index: number) => {
    if (pageProp?.config.children) {
      const child = pageProp.config.children[index];
      if (child) {
        pageProp.child = child.name;
        const uri = "/" + pageProp.ctx + "/" + pageProp.config.uri + "/" + child.uri;
        window.history.pushState({}, "", uri);
        changeIndex(index);
      }
    }
  };
  return (
    <>
      {coord.width ? (
        <div
          id="pixi-container"
          className="menu-pixi"
          style={{
            top: coord.mainMenuTop,
            left: coord.mainMenuLeft,
            width: coord.mainMenuW,
            height: coord.mainMenuH,
            backgroundColor: "white",
          }}
        >
          <svg viewBox="0 0 500 50" preserveAspectRatio="xMinYMin meet">
            {/* <defs>
              <pattern id="leaderboardimage" patternUnits="userSpaceOnUse" width="100" height="100">
                <rect x="0" y="0" width="150" height="100" fill={selected === "option1" ? "blue" : "gray"} />
                <image x="25" y="10" width="25" height="25" href={myImage} />
              </pattern>
            </defs> */}
            {/* 不规则形状1 */}
            <polygon
              ref={(el) => loadMenu(0, el)}
              id="menu-index0"
              points="0,0 100,0 75,50 0,50"
              fill={"grey"}
              // fill="url(#leaderboardimage)"
              stroke="white"
              strokeWidth={1}
              onClick={() => {
                openChild(0);
              }}
            />

            {/* 不规则形状2 */}
            <polygon
              ref={(el) => loadMenu(1, el)}
              id="menu-index1"
              points="100,0 200,0 175,50 75,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openChild(1)}
            />

            {/* 不规则形状3 */}
            <polygon
              ref={(el) => loadMenu(2, el)}
              id="menu-index2"
              points="200,0 300,0 275,50 175,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openChild(2)}
            />
            {/* 不规则形状4 */}
            <polygon
              ref={(el) => loadMenu(3, el)}
              id="menu-index3"
              points="300,0 400,0 375,50 275,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openChild(3)}
            />
            {/* 不规则形状5 */}
            <polygon
              ref={(el) => loadMenu(4, el)}
              id="menu-index4"
              points="400,0 500,0 500,50 375,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openChild(4)}
            />
          </svg>
        </div>
      ) : null}
    </>
  );
};

export default PlayMenu;

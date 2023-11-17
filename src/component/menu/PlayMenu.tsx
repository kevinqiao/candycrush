import { gsap } from "gsap";
import { useEffect } from "react";
import useCoord from "../../service/CoordManager";
import { usePageManager } from "../../service/PageManager";
import "./menu.css";
const colors = ["red", "green", "blue", "orange", "white"];

interface Props {
  currentIndex: number;
}

const PlayMenu: React.FC = () => {
  const coord = useCoord();
  const { prevPage, currentPage, openPage } = usePageManager();

  useEffect(() => {
    if (prevPage) {
      // const preicon = "#men-" + preIndexRef.current;
      // gsap.to(preicon, { y: 0, duration: 1 });
      const premenu = "#menu-" + prevPage.name;
      gsap.to(premenu, { fill: "grey", duration: 1 });
    }
    // setTimeout(() => {
    //   const curicon = "#menu-icon-" + currentIndex;
    //   gsap.to(curicon, { y: -20, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    //   const curmenu = "#menu-0" + currentIndex;
    //   gsap.to(curmenu, { fill: "red", duration: 0.7 });
    //   preIndexRef.current = currentIndex;
    // }, 100);
    // gsap.to(icon,{y:})
  }, [prevPage]);
  useEffect(() => {
    if (currentPage) {
      const curmenu = "#menu-" + currentPage.name;
      const delay = currentPage.isInitial ? 100 : 10;
      setTimeout(() => {
        gsap.to(curmenu, { fill: "red", duration: 0.7 });
      }, delay);
    }
  }, [currentPage]);

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
              id="menu-tournamentHome"
              points="0,0 100,0 75,50 0,50"
              fill={"grey"}
              // fill="url(#leaderboardimage)"
              stroke="white"
              strokeWidth={1}
              onClick={() => openPage({ name: "tournamentHome", data: {} })}
            />

            {/* 不规则形状2 */}
            <polygon
              id="menu-textureList"
              points="100,0 200,0 175,50 75,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openPage({ name: "textureList", data: {} })}
            />

            {/* 不规则形状3 */}
            <polygon
              id="menu-battleHome"
              points="200,0 300,0 275,50 175,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openPage({ name: "battleHome", data: {} })}
            />
            {/* 不规则形状4 */}
            <polygon
              id="menu-accountHome"
              points="300,0 400,0 375,50 275,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openPage({ name: "accountHome", data: {} })}
            />
            {/* 不规则形状5 */}
            <polygon
              id="menu-texturePlay"
              points="400,0 500,0 500,50 375,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openPage({ name: "texturePlay", data: {} })}
            />
          </svg>

          {/* {iconCoords
            .map((c, index) => {
              const w = Math.floor((c.w * coord.mainMenuRatio) / 1.5);
              const h = Math.floor((c.h * coord.mainMenuRatio) / 1.5);
              const x = Math.floor(c.x * coord.mainMenuRatio) - Math.floor(w / 2);
              const y = Math.floor(c.y * coord.mainMenuRatio) - Math.floor(h / 2);
              return {
                id: c.id,
                x,
                y,
                w,
                h,
              };
            })
            .map((c) => (
              <img
                key={"menu-icon-" + c.id}
                id={"menu-icon-" + c.id}
                style={{ position: "absolute", width: c.w, height: c.h, left: c.x, bottom: c.y, pointerEvents: "none" }}
                src="assets/boy.png"
              />
            ))} */}
        </div>
      ) : null}
    </>
  );
};

export default PlayMenu;

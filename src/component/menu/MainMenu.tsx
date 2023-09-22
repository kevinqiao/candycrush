import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import useCoord from "../../service/CoordManager";
import "./menu.css";
const colors = ["red", "green", "blue", "orange", "white"];
const iconCoords = [
  { id: 0, x: 40, y: 25, w: 25, h: 25 },
  { id: 1, x: 140, y: 25, w: 25, h: 25 },
  { id: 2, x: 240, y: 25, w: 25, h: 25 },
  { id: 3, x: 340, y: 25, w: 25, h: 25 },
  { id: 4, x: 440, y: 25, w: 25, h: 25 },
];
interface Props {
  currentIndex: number;
  onChange: (index: number) => void;
}
const MainMenu: React.FC<Props> = ({ currentIndex, onChange }) => {
  const coord = useCoord();
  const preIndexRef = useRef<number>(currentIndex);

  useEffect(() => {
  
    if (preIndexRef.current !== currentIndex) {
      const preicon = "#menu-icon-" + preIndexRef.current;
      gsap.to(preicon, { y: 0, duration: 1 });
      const premenu = "#menu-0" + preIndexRef.current;
      gsap.to(premenu, { fill: "grey", duration: 1 });
    }
    setTimeout(() => {
      const curicon = "#menu-icon-" + currentIndex;
      gsap.to(curicon, { y: -20, duration: 0.7, ease: "elastic.out(1, 0.3)" });
      const curmenu = "#menu-0" + currentIndex;
      gsap.to(curmenu, { fill: "red", duration: 0.7 });
      preIndexRef.current = currentIndex;
    }, 100);
    // gsap.to(icon,{y:})
  }, [currentIndex]);

  const change = (index: number) => {
    onChange(index);
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
              id="menu-00"
              points="0,0 100,0 75,50 0,50"
              fill={"grey"}
              // fill="url(#leaderboardimage)"
              stroke="white"
              strokeWidth={1}
              onClick={() => change(0)}
            />

            {/* 不规则形状2 */}
            <polygon
              id="menu-01"
              points="100,0 200,0 175,50 75,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => change(1)}
            />

            {/* 不规则形状3 */}
            <polygon
              id="menu-02"
              points="200,0 300,0 275,50 175,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => change(2)}
            />
            {/* 不规则形状4 */}
            <polygon
              id="menu-03"
              points="300,0 400,0 375,50 275,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => change(3)}
            />
            {/* 不规则形状5 */}
            <polygon
              id="menu-04"
              points="400,0 500,0 500,50 375,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => change(4)}
            />
          </svg>

          {iconCoords
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
            ))}
        </div>
      ) : null}
    </>
  );
};

export default MainMenu;

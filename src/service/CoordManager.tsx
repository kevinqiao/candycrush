import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import * as Constant from "../model/Constants";
const CoordContext = createContext<any>(null);

export const CoordProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState({ width: 0, height: 0 });
  console.log("coord prvoider");
  const updateCoord = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mh = (50 * w) / 500;
    const mainMenuH = mh > 120 ? 120 : mh;
    const mainMenuW = (500 * mainMenuH) / 50;
    const mainMenuTop = h - mainMenuH;
    const mainMenuLeft = Math.floor((w - mainMenuW) / 2);
    const mainMenuRatio = mainMenuH / 50;
    const sceneW = w >= h ? 0.65 * h : w;

    const cellW = Math.floor(sceneW / Constant.COLUMN);
    const sceneH = cellW * Constant.ROW;
    const isMobile = w > h ? false : true;
    const v: any = {
      width: w,
      height: h,
      mainMenuH,
      mainMenuW,
      mainMenuTop,
      mainMenuLeft,
      mainMenuRatio,
      // sceneW,
      // sceneH,
      // cellW,
      // cellH: cellW,
      isMobile,
    };
    setValue(v);
  };
  useEffect(() => {
    updateCoord();
    window.addEventListener("resize", updateCoord, true);
    return () => window.removeEventListener("resize", updateCoord, true);
  }, []);

  return <CoordContext.Provider value={value}> {children} </CoordContext.Provider>;
};

const useCoord = () => {
  return useContext(CoordContext);
};
export default useCoord;

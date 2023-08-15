import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import * as Constant from "../model/Constant";
const CoordContext = createContext<any>(null);

export const CoordProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState({ width: 0, height: 0 });
  const updateCoord = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const sceneW = w >= h ? 0.85 * h : w;
    const sceneH = h;
    const cellW = Math.floor(sceneW / Constant.COLUMN);

    const v: any = { width: w, height: h, sceneW, sceneH, cellW, cellH: cellW };

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

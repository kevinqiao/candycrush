import { ReactNode, createContext, useContext, useEffect, useState } from "react";
const CoordContext = createContext<any>(null);

export const CoordProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [enviornment, setEnviornment] = useState<number>(-1);
  const updateCoord = () => {
    const w = window.innerWidth as number;
    const h = window.innerHeight as number;
    const mh = (50 * w) / 500;
    const mainMenuH = mh > 120 ? 120 : mh;
    const mainMenuW = (500 * mainMenuH) / 50;
    const mainMenuTop = h - mainMenuH;
    const mainMenuLeft = Math.floor((w - mainMenuW) / 2);
    const mainMenuRatio = mainMenuH / 50;
    const isMobile = w > h ? false : true;
    const v: any = {
      width: w,
      height: h,
      mainMenuH,
      mainMenuW,
      mainMenuTop,
      mainMenuLeft,
      mainMenuRatio,
      isMobile,
      enviornment,
    };
    setValue(v);
  };
  useEffect(() => {
    const userAgent: string = navigator.userAgent || navigator.vendor || window.opera;
    console.log(userAgent);
    if (/Telegram/i.test(userAgent)) {
      return setEnviornment(0);
    } else if (/web/i.test(userAgent)) {
      return setEnviornment(1);
    }
  }, []);
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

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
const CoordContext = createContext<any>(null);

export const CoordProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [terminal, setTerminal] = useState<number>(-1);
  console.log("terminal:" + terminal);
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
      terminal,
    };
    setValue(v);
  };
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)) {
      setTerminal(0);
    }
    // 检测是否在 Telegram Desktop Web Browser 中
    else if (/Windows NT|Macintosh|Linux x86_64/i.test(userAgent)) {
      setTerminal(1);
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

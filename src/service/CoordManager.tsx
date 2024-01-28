import { ReactNode, createContext, useContext, useEffect, useState } from "react";
const CoordContext = createContext<any>({
  terminal: -1,
});

export const CoordProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

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
    };
    setValue(v);
  };

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      setTimeout(() => {
        window.Telegram.WebApp.expand();
        window.alert("web ready:" + window.innerHeight);
      }, 1000);
    }
    updateCoord();
    window.addEventListener("resize", updateCoord, true);
    return () => {
      window.removeEventListener("resize", updateCoord, true);
      window.Telegram.WebApp.close();
    };
  }, []);

  return <CoordContext.Provider value={value}> {children} </CoordContext.Provider>;
};

const useCoord = () => {
  return useContext(CoordContext);
};
export default useCoord;

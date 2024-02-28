import { gsap } from "gsap";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
const CoordContext = createContext<any>({
  terminal: -1,
});

export const CoordProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const updateCoord = () => {
    const w = window.innerWidth as number;
    const h = window.innerHeight as number;
    const headH = Math.floor(Math.max(50, Math.min(w * 0.06, 100)));
    const LobbyMenuH = w > h ? h - headH : (50 * w) / 500;
    const LobbyMenuW = w < h ? w : Math.max(70, w * 0.12);

    const isMobile = w > h ? false : true;
    const v: any = {
      width: w,
      height: h,
      LobbyMenuH,
      LobbyMenuW,
      headH,
      isMobile,
    };
    setValue(v);

    const loadMain = document.getElementById("main-loader");
    if (loadMain)
      setTimeout(
        () =>
          gsap.to(loadMain, {
            alpha: 0,
            duration: 0.3,
            onComplete: () => {
              if (loadMain?.parentNode) loadMain.parentNode.removeChild(loadMain);
            },
          }),
        300
      );
  };

  useEffect(() => {
    updateCoord();
    window.addEventListener("resize", updateCoord, true);
    return () => {
      window.removeEventListener("resize", updateCoord, true);
      // if (window.Telegram) window.Telegram.WebApp.close();
    };
  }, []);

  return <CoordContext.Provider value={value}> {children} </CoordContext.Provider>;
};

const useCoord = () => {
  return useContext(CoordContext);
};
export default useCoord;

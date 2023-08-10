import { ReactNode, createContext, useContext, useEffect, useState } from "react";

const CoordContext = createContext<any>(null);

export const CoordProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState({ width: 800, height: 600 });
  const updateCoord = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const v: any = { width: w, height: h };

    setValue(v);
  };
  useEffect(() => {
    updateCoord();
    window.addEventListener("resize", updateCoord, true);
    return () => window.removeEventListener("resize", updateCoord, true);
  }, []);

  return <CoordContext.Provider value={value}> {children} </CoordContext.Provider>;
};

const useCoordManager = () => {
  return useContext(CoordContext);
};
export default useCoordManager;

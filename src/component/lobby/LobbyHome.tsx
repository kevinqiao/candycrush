import { SlideNavProvider } from "component/SlideNavManager";
import PageProps from "model/PageProps";
import React, { useMemo } from "react";
import useCoord from "service/TerminalManager";
import LobbyContent from "./LobbyContent";
import MenuNav from "./menunav/MenuNav";
const LobbyHome: React.FC<PageProps> = (prop) => {
  const { width, height } = useCoord();
  const render = useMemo(() => {
    return (
      <>
        <div style={{ position: "relative", display: "flex", height: height }}>
          <SlideNavProvider pageProp={prop}>
            <MenuNav />
            <LobbyContent />
          </SlideNavProvider>
        </div>
      </>
    );
  }, [prop, height, width]);
  return <>{render}</>;
};

export default LobbyHome;

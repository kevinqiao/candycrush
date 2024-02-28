import { SlideNavProvider } from "component/SlideNavManager";
import PageProps from "model/PageProps";
import React, { useMemo } from "react";
import useCoord from "service/CoordManager";
import LobbyContent from "./LobbyContent";
import LobbyMenu from "./LobbyMenu";
const LobbyHome: React.FC<PageProps> = (prop) => {
  const { width, height, headH } = useCoord();
  const render = useMemo(() => {
    return (
      <div style={{ position: "relative", display: "flex", height: height }}>
        <SlideNavProvider pageProp={prop}>
          <LobbyMenu />
          {/* <div style={{ width: "100%", height: height - 60, backgroundColor: "green" }}></div>
          {/* <div style={{ width: 90, height: 800, backgroundColor: "blue" }}></div> */}
          <LobbyContent />
          {/* <div style={{ width: "100%", height: "100%", backgroundColor: "red" }}></div> */}
        </SlideNavProvider>
      </div>
    );
  }, [prop, height, width]);
  return <>{render}</>;
};

export default LobbyHome;

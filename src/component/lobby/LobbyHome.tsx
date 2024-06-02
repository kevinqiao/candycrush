import { SlideNavProvider } from "component/SlideNavManager";
import PageProps from "model/PageProps";
import React, { useMemo } from "react";
import useCoord from "service/TerminalManager";
import LobbyContent from "./LobbyContent";
import LobbyMenu from "./LobbyMenu";
const LobbyHome: React.FC<PageProps> = (prop) => {
  const { width, height, headH } = useCoord();
  console.log(prop);
  const render = useMemo(() => {
    return (
      <>
        <div style={{ position: "relative", display: "flex", height: height }}>
          <SlideNavProvider pageProp={prop}>
            <LobbyMenu />
            <LobbyContent />
          </SlideNavProvider>
        </div>
      </>
    );
  }, [prop, height, width]);
  return <>{render}</>;
};

export default LobbyHome;

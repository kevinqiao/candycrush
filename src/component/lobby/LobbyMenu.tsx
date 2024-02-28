import { useSlideNavManager } from "component/SlideNavManager";
import React from "react";
import styled from "styled-components";
import useCoord from "../../service/CoordManager";
import "./menu.css";
const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  height: 35px;
  background-color: blue;
  border-radius: 4px;
  margin-top: 10px;
`;
const LobbyMenu: React.FC = () => {
  const { width, height, LobbyMenuH, LobbyMenuW } = useCoord();
  const { loadMenu, changeIndex } = useSlideNavManager();
  const openChild = (index: number) => {
    changeIndex(index);
  };
  return (
    <>
      {width >= height ? (
        <div style={{ width: LobbyMenuW, height: "99%", backgroundColor: "blue", margin: "5px 10px 15px 5px" }}>
          <MenuItem key={"tournament"} onClick={() => changeIndex(0)}>
            <span style={{ color: "white" }}>Tournament</span>
          </MenuItem>
          <MenuItem key={"League"} onClick={() => changeIndex(1)}>
            <span style={{ color: "white" }}>League</span>
          </MenuItem>
          <MenuItem key={"Battle"} onClick={() => changeIndex(2)}>
            <span style={{ color: "white" }}>Record</span>
          </MenuItem>
          <MenuItem key={"Account"} onClick={() => changeIndex(3)}>
            <span style={{ color: "white" }}>Account</span>
          </MenuItem>
          <MenuItem key={"Market"} onClick={() => changeIndex(4)}>
            <span style={{ color: "white" }}>Market</span>
          </MenuItem>
        </div>
      ) : (
        <div
          style={{
            position: "fixed",
            width: "100%",
            height: LobbyMenuH,
            display: "flex",
            justifyContent: "center",
            bottom: 0,
            left: 0,
            margin: 0,
          }}
        >
          <svg viewBox="0 0 500 50" preserveAspectRatio="xMinYMin meet">
            <polygon
              ref={(el) => loadMenu(0, el)}
              id="menu-index0"
              points="0,0 100,0 75,50 0,50"
              fill={"grey"}
              // fill="url(#leaderboardimage)"
              stroke="white"
              strokeWidth={1}
              onClick={() => {
                openChild(0);
              }}
            />

            {/* 不规则形状2 */}
            <polygon
              ref={(el) => loadMenu(1, el)}
              id="menu-index1"
              points="100,0 200,0 175,50 75,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openChild(1)}
            />

            {/* 不规则形状3 */}
            <polygon
              ref={(el) => loadMenu(2, el)}
              id="menu-index2"
              points="200,0 300,0 275,50 175,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openChild(2)}
            />
            {/* 不规则形状4 */}
            <polygon
              ref={(el) => loadMenu(3, el)}
              id="menu-index3"
              points="300,0 400,0 375,50 275,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openChild(3)}
            />
            {/* 不规则形状5 */}
            <polygon
              ref={(el) => loadMenu(4, el)}
              id="menu-index4"
              points="400,0 500,0 500,50 375,50"
              fill={"grey"}
              stroke="white"
              strokeWidth={1}
              onClick={() => openChild(4)}
            />
          </svg>
        </div>
      )}
    </>
  );
};

export default LobbyMenu;

import { useSlideNavManager } from "component/SlideNavManager";
import { useConvex } from "convex/react";
import { BattleModel } from "model/Battle";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { api } from "../../convex/_generated/api";
import useCoord from "../../service/CoordManager";
import { useUserManager } from "../../service/UserManager";
import BattleItem from "./BattleItem";
import "./battle.css";
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: ${(props) => props.height};
  background-color: white;
  overflow-y: auto;
  overflow-x: hidden;
`;
const BattleHome: React.FC = () => {
  const battleRef = useRef<HTMLDivElement | null>(null);
  const { width, height, headH, LobbyMenuH } = useCoord();
  const { user } = useUserManager();
  const { menuIndex } = useSlideNavManager();
  const lastTimeRef = useRef<number>(0);
  const [battles, setBattles] = useState<any>(null);
  const [completed, setCompleted] = useState<number>(1); //0-uncomplete 1-completed
  const convex = useConvex();

  useEffect(() => {
    if (!user || !convex || menuIndex !== 2) return;

    const from = battles && battles.length > 0 ? battles[0].time : undefined;
    convex.query(api.battle.findMyBattles, { uid: user.uid, token: user.token, from }).then((bs: any) => {
      if (bs.length > 0) {
        bs.sort((a: any, b: any) => b.time - a.time);
        console.log(bs);
        lastTimeRef.current = bs[0].time;
        setBattles((pre: any) => (pre ? [...bs, ...pre] : bs));
      }
    });
  }, [user, convex, menuIndex]);
  const bgColor = useCallback(
    (type: number) => {
      return type === completed ? "blue" : "grey";
    },
    [completed]
  );
  const changeTab = useCallback(
    (type: number) => {
      setCompleted(type);
    },
    [user]
  );
  return (
    <Container height={`${height - headH}px`}>
      {/* <div className="tab_container">
        <div className="tab_bar">
          <div
            className="tab_cell"
            style={{ backgroundColor: bgColor(1), borderRadius: "5px 0px 0px 5px" }}
            onClick={() => changeTab(1)}
          >
            Completed
          </div>
          <div
            className="tab_cell"
            style={{ backgroundColor: bgColor(0), borderRadius: "0px 5px 5px 0px" }}
            onClick={() => changeTab(0)}
          >
            Uncomplete
          </div>
        </div>
      </div> */}
      <div
        ref={battleRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {battles ? (
          <>
            {battles.map((t: BattleModel, index: number) => (
              <BattleItem key={index + "battle"} battle={t} />
            ))}
            <div style={{ height: width < height ? LobbyMenuH : 0 }}></div>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <div className="loader"></div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default BattleHome;

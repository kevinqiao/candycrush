import { useSlideNavManager } from "component/SlideNavManager";
import { useConvex } from "convex/react";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { api } from "../../convex/_generated/api";
import useCoord from "../../service/TerminalManager";
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
  const [battles, setBattles] = useState<any>(null);
  const convex = useConvex();

  useEffect(() => {
    const getList = async () => {
      const history = await convex.query(api.battle.findMyBattles, { uid: user.uid, token: user.token });
      history.sort((a: any, b: any) => b.time - a.time);
      setBattles(history);
    };
    if (!user || !convex || menuIndex !== 2) return;
    getList();
  }, [user, convex, menuIndex]);

  return (
    <>
      <Container height={`${height - headH}px`}>
        <div
          ref={battleRef}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {battles && battles.map((t: any, index: number) => <BattleItem key={t.battleId} {...t} />)}
          <div style={{ height: width < height ? LobbyMenuH : 0 }}></div>
        </div>
      </Container>
    </>
  );
};

export default BattleHome;

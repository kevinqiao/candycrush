import { useSlideNavManager } from "component/SlideNavManager";
import React, { useEffect, useState } from "react";
import useLocalization from "service/LocalizationManager";
import styled from "styled-components";
import useCoord from "../../service/TerminalManager";
import useTournamentManager from "../../service/TournamentManager";
import TournamentItem from "./TournamentItem";
const Container = styled.div`
  display: flex;
  flexdirection: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: ${(props) => props.height};
  overflow-y: auto;
  overflow-x: hidden;
`;
const TournamentHome: React.FC = () => {
  const { width, height, headH, LobbyMenuH } = useCoord();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const { menuIndex } = useSlideNavManager();
  const { listActives } = useTournamentManager();
  const resources = useLocalization();
  console.log(resources);
  useEffect(() => {
    if (resources) {
      console.log(resources["menu"]["account"]);
      console.log(resources["bar"]["setting"]);
    }
  }, [resources]);
  useEffect(() => {
    if (menuIndex === 0) {
      listActives().then((ts) => {
        setTournaments(ts);
      });
    }
  }, [listActives, menuIndex]);
  console.log(tournaments);
  return (
    <Container height={`${height - headH}px`}>
      <div style={{ width: "100%", height: "100%" }}>
        <div style={{ height: headH }}></div>
        {tournaments.map((t) => (
          <TournamentItem key={t.id} tournament={t} />
        ))}

        <div style={{ height: width < height ? LobbyMenuH : 0 }}></div>
      </div>
    </Container>
  );
};

export default TournamentHome;

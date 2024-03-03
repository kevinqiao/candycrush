import React, { useEffect, useState } from "react";
import styled from "styled-components";
import useCoord from "../../service/CoordManager";
import useTournamentManager from "../../service/TournamentManager";
import TournamentItem from "./TournamentItem";
const Container = styled.div`
  display: flex;
  flexdirection: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: ${(props) => props.height};
  background-color: white;
  overflow-y: auto;
  overflow-x: hidden;
`;
const TournamentHome: React.FC = () => {
  const { width, height, headH, LobbyMenuH } = useCoord();
  const [tournaments, setTournaments] = useState<any[]>([]);

  const { listActives } = useTournamentManager();
  useEffect(() => {
    listActives().then((ts) => {
      setTournaments(ts);
      return;
    });
  }, [listActives]);

  return (
    <Container height={`${height - headH}px`}>
      <div style={{ width: "100%", height: "100%" }}>
        {tournaments.map((t) => (
          <TournamentItem key={t.id} tournament={t} />
        ))}
        {Array.from({ length: 25 }, (_, k) => k).map((p, index) => (
          <TournamentItem key={p} />
        ))}
        <div style={{ height: width < height ? LobbyMenuH : 0 }}></div>
      </div>
    </Container>
  );
};

export default TournamentHome;

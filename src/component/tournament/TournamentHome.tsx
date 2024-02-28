import React, { useEffect, useState } from "react";
import useCoord from "../../service/CoordManager";
import useTournamentManager from "../../service/TournamentManager";
import TournamentItem from "./TournamentItem";
const TournamentHome: React.FC = () => {
  const { width, height } = useCoord();
  const [tournaments, setTournaments] = useState<any[]>([]);

  const { listActives } = useTournamentManager();
  useEffect(() => {
    listActives().then((ts) => {
      setTournaments(ts);
      return;
    });
  }, [listActives]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div style={{ width: "100%", height: "100%" }}>
        {tournaments.map((t) => (
          <TournamentItem key={t.id} tournament={t} />
        ))}
        {/* {Array.from({ length: 25 }, (_, k) => k).map((p, index) => (
          <TournamentItem key={p} />
        ))} */}
      </div>
    </div>
  );
};

export default TournamentHome;

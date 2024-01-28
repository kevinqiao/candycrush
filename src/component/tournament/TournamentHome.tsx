import { useEffect, useState } from "react";
import useCoord from "../../service/CoordManager";
import useTournamentManager from "../../service/TournamentManager";
import TournamentItem from "./TournamentItem";
const TournamentHome: React.FC = () => {
  const { width, height } = useCoord();
  const [tournaments, setTournaments] = useState<any[]>([]);

  const { listActives } = useTournamentManager();
  useEffect(() => {
    listActives().then((ts) => setTournaments(ts));
  }, [listActives]);
  return (
    <div
      style={{
        width: "100vw",
        height: height,
        backgroundColor: "red",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {tournaments.map((t) => (
        <TournamentItem key={t.id} tournament={t} />
      ))}
      {Array.from({ length: 25 }, (_, k) => k).map((p, index) => (
        <div key={p} style={{ height: 120, width: "100%", backgroundColor: index % 2 === 0 ? "blue" : "green" }}></div>
      ))}
    </div>
  );
};

export default TournamentHome;

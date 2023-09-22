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
        <TournamentItem key={t.id} data={t} />
      ))}
      {/* {Array.from({ length: 25 }, (_, k) => k).map((p, index) => (
        <TournamentItem key={p} />
      ))} */}
    </div>
  );
};

export default TournamentHome;

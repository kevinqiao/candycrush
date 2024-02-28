import { Tournament } from "model/Tournament";
import React, { useRef } from "react";
import useTournamentManager from "service/TournamentManager";
import "./tournament.css";
interface Props {
  tournament: Tournament;
}
const TournamentItem: React.FC<Props> = ({ tournament }: Props) => {
  const itemRef = useRef(null);
  const { join } = useTournamentManager();
  return (
    <div ref={itemRef} className="tournament-item">
      <span style={{ fontSize: "20px", color: "black" }}>Tournament({tournament.id})</span>
      <div className="play-btn" onClick={() => join(tournament.id)}>
        Play
      </div>
    </div>
  );
};

export default TournamentItem;

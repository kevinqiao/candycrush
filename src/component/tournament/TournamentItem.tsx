import { useRef } from "react";
import { TournamentDef } from "../../model/TournamentCfg";
import { usePageManager } from "../../service/PageManager";
import "./tournament.css";
interface Props {
  tournament: TournamentDef;
}
const TournamentItem: React.FC<Props> = ({ tournament }) => {
  const itemRef = useRef(null);
  const { stacks, openPage } = usePageManager();
  // const { join } = useTournamentManager();
  return (
    <div ref={itemRef} className="tournament-item">
      <span style={{ fontSize: "20px", color: "black" }}>Tournament({tournament.id})</span>
      <div
        className="play-btn"
        onClick={(e) => {
          const p = stacks.find((s) => s.name === "battlePlay");
          if (!p) openPage({ name: "battlePlay", data: { act: "join", tournament } });
        }}
      >
        Play
      </div>
    </div>
  );
};

export default TournamentItem;

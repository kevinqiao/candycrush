import { useCallback, useRef } from "react";
import { TournamentDef } from "../../model/TournamentCfg";
import { usePageManager } from "../../service/PageManager";
import { useUserManager } from "../../service/UserManager";
import "./tournament.css";
interface Props {
  tournament: TournamentDef;
}
const TournamentItem: React.FC<Props> = ({ tournament }) => {
  const itemRef = useRef(null);
  const { stacks, openPage } = usePageManager();
  const { user } = useUserManager();
  console.log(stacks);
  const joinBattle = useCallback(() => {
    if (!user) {
      openPage({ name: "signin" });
      return;
    }
    const p = stacks.find((s) => s.name === "battlePlay");
    if (!p) openPage({ name: "battlePlay", data: { act: "join", tournament } });
  }, [user, stacks, openPage, tournament]);
  return (
    <div ref={itemRef} className="tournament-item">
      <span style={{ fontSize: "20px", color: "black" }}>Tournament({tournament.id})</span>
      <div className="play-btn" onClick={() => joinBattle()}>
        Play
      </div>
    </div>
  );
};

export default TournamentItem;

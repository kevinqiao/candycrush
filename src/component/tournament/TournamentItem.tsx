import { useRef } from "react";
import { TournamentDef } from "../../model/TournamentCfg";
import useTournamentManager from "../../service/TournamentManager";
import "./tournament.css";
interface Props {
  tournament: TournamentDef;
}
const TournamentItem: React.FC<Props> = ({ tournament }) => {
  const itemRef = useRef(null);

  const { join } = useTournamentManager();
  // useEffect(() => {
  //   if (itemRef.current) {
  //     const hammer = new Hammer(itemRef.current);
  //     hammer.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_ALL, threshold: 10, velocity: 0.3 }));

  //     hammer.on("swipeleft", moveRight);
  //     hammer.on("swiperight", moveLeft);
  //   }
  //   return () => {};
  // }, [itemRef.current, moveLeft, moveRight]);
  return (
    <div ref={itemRef} className="tournament-item">
      <span style={{ fontSize: "20px", color: "black" }}>Tournament({tournament.id})</span>
      <div
        className="play-btn"
        onClick={(e) => {
          console.log("play clicked in item");
          join(tournament);
        }}
      >
        Play
      </div>
    </div>
  );
};

export default TournamentItem;

import { useRef } from "react";
import useTournamentManager from "../../service/TournamentManager";
import "./tournament.css";
interface Props {
  data: any;
}
const TournamentItem: React.FC<Props> = ({ data }) => {
  const itemRef = useRef(null);

  const { join, joinByType } = useTournamentManager();
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
      <span style={{ fontSize: "20px", color: "black" }}>Tournament({data.type})</span>
      <div
        className="play-btn"
        onClick={(e) => {
          console.log("play clicked in item");
          joinByType(data.id);
        }}
      >
        Play
      </div>
    </div>
  );
};

export default TournamentItem;

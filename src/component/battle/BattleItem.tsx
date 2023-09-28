import BattleModel from "../../model/Battle";
import { usePageManager } from "../../service/PageManager";
import "./battle.css";
interface Props {
  battle: BattleModel;
}
const BattleItem: React.FC<Props> = ({ battle }) => {
  const { openPage } = usePageManager();

  return (
    <div className="tournament-item">
      <span style={{ fontSize: "20px", color: "black" }}>Battle({battle.type})</span>
      <div
        className="play-btn"
        onClick={(e) => {
          openPage({ name: "battleReplay", data: { battleId: battle.id, gameId: battle.games[0] } });
        }}
      >
        RePlay
      </div>
    </div>
  );
};

export default BattleItem;

import BattleModel from "../../model/Battle";
import { usePageManager } from "../../service/PageManager";
import "./battle.css";
interface Props {
  battle: BattleModel;
}
const BattleItem: React.FC<Props> = ({ battle }) => {
  const { openPage } = usePageManager();

  return (
    <div className="battle-item">
      <span style={{ fontSize: "20px", color: "black" }}>Battle({battle.type})</span>
      {battle?.games?.map((g) => (
        <div
          key={g.gameId}
          className="play-btn"
          onClick={(e) =>
            openPage({
              name: "gameReplay",
              data: { battleId: battle.id, gameId: g.gameId },
            })
          }
        >
          RePlay({g.uid})
        </div>
      ))}
    </div>
  );
};

export default BattleItem;

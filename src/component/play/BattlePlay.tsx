import BattleModel from "../../model/Battle";
import { BATTLE_TYPE } from "../../model/Constants";
import PageProps from "../../model/PageProps";
import SoloBattle from "./SoloBattle";
import SyncBattle from "./SyncBattle";

const BattlePlay: React.FC<PageProps> = ({ data, position }) => {
  const battle = data as BattleModel;
  console.log(battle);

  return (
    <div style={{ width: position?.width, height: position?.height, backgroundColor: "blue" }}>
      <div style={{ height: 50 }} />
      {battle.type === BATTLE_TYPE.SOLO ? <SoloBattle battle={battle} position={position} /> : null}
      {battle.type === BATTLE_TYPE.SYNC ? <SyncBattle battle={battle} position={position} /> : null}
    </div>
  );
};

export default BattlePlay;

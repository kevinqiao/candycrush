import { useRef } from "react";
import BattleModel from "../../model/Battle";
import { BATTLE_TYPE } from "../../model/Constants";
import PageProps from "../../model/PageProps";
import BattleProvider from "../../service/BattleManager";
import useDimension from "../../util/useDimension";
import SoloBattle from "./SoloBattle";

const BattlePlay: React.FC<PageProps> = ({ data }) => {
  const eleRef = useRef<HTMLDivElement | null>(null);
  const battle = data as BattleModel;
  const { width, height } = useDimension(eleRef);

  return (
    <div ref={eleRef} style={{ width: "100%", height: "100%", backgroundColor: "blue" }}>
      <BattleProvider battle={data}>
        <>
          {battle.type === BATTLE_TYPE.SOLO ? <SoloBattle battle={battle} width={width} height={height} /> : null}
          {/* {battle.type === BATTLE_TYPE.SYNC ? <SyncBattle battle={battle} position={position} /> : null} */}
        </>
      </BattleProvider>
    </div>
  );
};

export default BattlePlay;

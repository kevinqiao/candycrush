import { useRef } from "react";
import BattleModel from "../../model/Battle";
import PageProps from "../../model/PageProps";
import BattleProvider from "../../service/BattleManager";
import SceneProvider from "../../service/SceneManager";
import useDimension from "../../util/useDimension";
import SoloBattle from "./BattlePlay";

const BattleHome: React.FC<PageProps> = ({ data }) => {
  const eleRef = useRef<HTMLDivElement | null>(null);
  const battle = data as BattleModel;
  const { width, height } = useDimension(eleRef);

  return (
    <div ref={eleRef} style={{ width: "100%", height: "100%", backgroundColor: "blue" }}>
      <BattleProvider battle={data}>
        <SceneProvider width={width} height={height}>
          <SoloBattle />
        </SceneProvider>
      </BattleProvider>
    </div>
  );
};

export default BattleHome;

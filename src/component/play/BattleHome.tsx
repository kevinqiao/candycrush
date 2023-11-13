import { useRef } from "react";
import PageProps from "../../model/PageProps";
import BattleProvider from "../../service/BattleManager";
import SceneProvider from "../../service/SceneManager";
import useDimension from "../../util/useDimension";
import BattlePlay from "./BattlePlay";

const BattleHome: React.FC<PageProps> = ({ data }) => {
  const eleRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useDimension(eleRef);

  return (
    <SceneProvider>
      <div ref={eleRef} style={{ width: "100%", height: "100%", backgroundColor: "blue" }}>
        <BattleProvider battle={data}>
          <BattlePlay />
        </BattleProvider>
      </div>
    </SceneProvider>
  );
};

export default BattleHome;

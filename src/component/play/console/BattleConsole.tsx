import { useEffect, useMemo, useRef } from "react";
import { useBattleManager } from "../../../service/BattleManager";
import { SceneModel } from "../../../service/SceneManager";
interface Props {
  scene: SceneModel;
}
const BattleConsole: React.FC<Props> = ({ scene }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { gamescores } = useBattleManager();
  useEffect(() => {
    if (sceneContainerRef.current && scene) sceneContainerRef.current.appendChild(scene.app.view as unknown as Node);
  }, [scene]);
  const render = useMemo(() => {
    return (
      <div
        ref={sceneContainerRef}
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
          border: 0,
          backgroundColor: "transparent",
        }}
      ></div>
    );
  }, []);
  return <>{render}</>;
};

export default BattleConsole;

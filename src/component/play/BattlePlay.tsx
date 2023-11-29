import { ReactNode, useEffect, useMemo, useRef } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { useBattleManager } from "../../service/BattleManager";
import { useSceneManager } from "../../service/SceneManager";

const BattlePlay = ({ children }: { children: ReactNode }) => {
  const { battle } = useBattleManager();
  const { scenesStaged } = useSceneManager();
  const isOpenRef = useRef<boolean>(false);
  console.log(scenesStaged);
  useEffect(() => {
    const battleScenes = [SCENE_NAME.BATTLE_CONSOLE, SCENE_NAME.BATTLE_HOME];
    const gameIds = battle?.games.map((g) => g.gameId);
    if (gameIds) battleScenes.push(...gameIds);
    if (battle && !isOpenRef.current && battleScenes.every((scene) => scenesStaged.includes(scene))) {
      isOpenRef.current = true;
    }
  }, [scenesStaged, battle]);

  const render = useMemo(() => {
    return <div style={{ width: "100%", height: "100%", backgroundColor: "blue" }}>{children}</div>;
  }, []);
  return <>{render}</>;
};

export default BattlePlay;

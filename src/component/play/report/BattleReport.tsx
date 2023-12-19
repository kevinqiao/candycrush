import { useCallback } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { FrontScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";

const BattleReport: React.FC = () => {
  const { scenes } = useSceneManager();
  const load = useCallback(
    (el: HTMLDivElement) => {
      if (scenes) {
        const frontScene = scenes.get(SCENE_NAME.BATTLE_FRONT) as FrontScene;
        if (frontScene) frontScene.battleReport.sceneEle = el;
      }
    },
    [scenes]
  );

  return <div ref={load} style={{ width: "80%", height: "70%", backgroundColor: "white" }}></div>;
};

export default BattleReport;

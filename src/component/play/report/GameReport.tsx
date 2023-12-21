import { useCallback } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { FrontScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";

const GameReport: React.FC = () => {
  const { scenes } = useSceneManager();
  const load = useCallback(
    (type: number, el: HTMLDivElement | null) => {
      if (scenes && el) {
        const frontScene = scenes.get(SCENE_NAME.BATTLE_FRONT) as FrontScene;
        if (!frontScene) return;
        if (!frontScene.gameReport) frontScene.gameReport = {};
        console.log("load game report element :" + type);
        if (frontScene)
          switch (type) {
            case 0:
              frontScene.gameReport.sceneEle = el;
              break;
            case 1:
              frontScene.gameReport.baseScoreEle = el;
              break;
            case 2:
              frontScene.gameReport.timeScoreEle = el;
              break;
            case 3:
              frontScene.gameReport.goalScoreEle = el;
              break;
            default:
              break;
          }
      }
    },
    [scenes]
  );

  return (
    <div ref={(ele) => load(0, ele)} style={{ width: "80%", height: "70%", backgroundColor: "white", opacity: 0 }}>
      <div id="baseScore" ref={(ele) => load(1, ele)}></div>
      <div id="timeScore" ref={(ele) => load(2, ele)}></div>
      <div id="goalScore" ref={(ele) => load(3, ele)}></div>
    </div>
  );
};

export default GameReport;

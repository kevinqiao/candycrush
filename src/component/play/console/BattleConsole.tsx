import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef } from "react";
import { CandyModel } from "../../../model/CandyModel";
import { SceneModel, useSceneManager } from "../../../service/SceneManager";
import useDimension from "../../../util/useDimension";
interface Props {
  scene: SceneModel;
}
const BattleConsole: React.FC = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { scenes } = useSceneManager();
  const { width, height } = useDimension(sceneContainerRef);

  useEffect(() => {
    if (sceneContainerRef.current) {
      const consoleScene = scenes.get("console");
      if (!consoleScene && width > 0 && height > 0) {
        const scene = {
          app: new PIXI.Application({
            width: width * 0.8,
            height: height * 0.6,
            backgroundAlpha: 0,
          }),
          x: 0,
          y: 0,
          width: width,
          height: height,
          candies: new Map<number, CandyModel>(),
        };
        scenes.set("console", scene);
        sceneContainerRef.current.appendChild(scene.app.view as unknown as Node);
      }
    }
  }, [scenes, width, height]);
  const render = useMemo(() => {
    return (
      <div
        ref={sceneContainerRef}
        style={{
          width: "100%",
          height: "100%",
          margin: 0,
          border: 0,
          backgroundColor: "white",
        }}
      ></div>
    );
  }, []);
  return <>{render}</>;
};

export default BattleConsole;

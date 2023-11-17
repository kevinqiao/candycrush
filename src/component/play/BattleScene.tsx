import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef } from "react";
import { CandyModel } from "../../model/CandyModel";
import { useSceneManager } from "../../service/SceneManager";
import useDimension from "../../util/useDimension";

const BattleScene: React.FC = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { scenes } = useSceneManager();
  const { width, height } = useDimension(sceneContainerRef);

  useEffect(() => {
    if (sceneContainerRef.current) {
      const scene = scenes.get("battle");
      if (!scene && width > 0 && height > 0) {
        const scene = {
          app: new PIXI.Application({
            width: width,
            height: height,
            backgroundAlpha: 0,
          }),
          x: 0,
          y: 0,
          width: width,
          height: height,
          candies: new Map<number, CandyModel>(),
        };
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.5); // 0x000000 为黑色，0.5 为透明度
        background.drawRect(0, 0, scene.app.renderer.width, scene.app.renderer.height);
        background.endFill();

        // 将背景 Sprite 添加到舞台
        scene.app.stage.addChild(background);
        scene.app.stage.removeChild(background);
        scenes.set("battle", scene);
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
          backgroundColor: "transparent",
        }}
      ></div>
    );
  }, []);
  return <>{render}</>;
};

export default BattleScene;

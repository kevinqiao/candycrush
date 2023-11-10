import { useEffect, useMemo, useRef } from "react";
import useGameViewModel from "../../service/GameViewModel";
import { SceneModel } from "../../service/SceneManager";
interface Props {
  scene: SceneModel;
}
const GamePlay: React.FC<Props> = ({ scene }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);

  // const [scene, setScene] = useState<PIXI.Application>();
  // const [candy_textures, setCandyTextures] = useState<{ id: number; texture: PIXI.Texture }[]>();

  useGameViewModel(scene.app, scene.textures);
  useEffect(() => {
    if (sceneContainerRef.current) sceneContainerRef.current.appendChild(scene.app.view as unknown as Node);
  }, [scene]);
  // const { width, height } = useDimension(sceneContainerRef);

  // useEffect(() => {
  //   let app: PIXI.Application;
  //   // (app.view as any).style.pointerEvents = 'none';
  //   if (sceneContainerRef.current && height > 0 && width > 0) {
  //     app = new PIXI.Application({
  //       width: width,
  //       height: height,
  //       backgroundAlpha: 0,
  //     } as any);
  //     sceneContainerRef.current.appendChild(app.view as unknown as Node);
  //     const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
  //     const frameSize = 100;
  //     const candy_textures = candy_texture_defs.map((c) => {
  //       const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
  //       const texture = new PIXI.Texture(baseTexture, rect);
  //       return { id: c.id, texture };
  //     });
  //     setCandyTextures(candy_textures);
  //     setScene(app);
  //   }

  //   return () => {
  //     if (app) app.destroy(true);
  //   };
  // }, [width, height]);
  
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

export default GamePlay;

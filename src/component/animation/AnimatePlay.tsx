import { useEffect, useMemo, useRef } from "react";
import { SceneModel } from "../../service/SceneManager";
interface Props {
  scene: SceneModel;
}
const AnimatePlay: React.FC<Props> = ({ scene }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (sceneContainerRef.current) sceneContainerRef.current.appendChild(scene.app.view as unknown as Node);
  }, [scene]);
  // const [scene, setScene] = useState<PIXI.Application>();
  // const [candy_textures, setCandyTextures] = useState<{ id: number; texture: PIXI.Texture }[]>();
  // const { playCollect } = useCollectCandies(scene, candy_textures);
  // const { event } = useEventSubscriber(["candyRemoved"], []);
  // const { width, height } = useDimension(sceneContainerRef);
  // useEffect(() => {
  //   if (event) playCollect(event.data);
  // }, [event]);
  // useEffect(() => {
  //   // Initialize PixiJS Application
  //   const app = new PIXI.Application({
  //     width,
  //     height,
  //     backgroundAlpha: 0,
  //   } as any);
  //   (app.view as any).style.pointerEvents = "none";
  //   if (sceneContainerRef.current) {
  //     sceneContainerRef.current.appendChild(app.view as unknown as Node);
  //     const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
  //     const frameSize = 100;
  //     const candy_textures = candy_texture_defs.map((c) => {
  //       const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
  //       const texture = new PIXI.Texture(baseTexture, rect);
  //       return { id: c.id, texture };
  //     });

  //     setCandyTextures(candy_textures);
  //   }
  //   setScene(app);
  //   return () => {
  //     app.destroy(true);
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
  // return <div ref={sceneContainerRef} style={{ width, height }}></div>;
};

export default AnimatePlay;

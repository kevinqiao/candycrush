import * as PIXI from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";
import candy_texture_defs from "../../model/candy_textures";
import useEventSubscriber from "../../service/EventManager";
import useDimension from "../../util/useDimension";
import useCollectCandies from "./CollectCandies ";
interface Props {
  width: number;
  height: number;
  pid?: string;
}
const AnimatePlay: React.FC = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const [scene, setScene] = useState<PIXI.Application>();
  const [candy_textures, setCandyTextures] = useState<{ id: number; texture: PIXI.Texture }[]>();
  const { playCollect } = useCollectCandies(scene, candy_textures);
  const { event } = useEventSubscriber(["candyRemoved"], []);
  const { width, height } = useDimension(sceneContainerRef);
  useEffect(() => {
    if (event) playCollect(event.data);
  }, [event]);
  useEffect(() => {
    // Initialize PixiJS Application
    const app = new PIXI.Application({
      width,
      height,
      backgroundAlpha: 0,
    } as any);
    (app.view as any).style.pointerEvents = "none";
    if (sceneContainerRef.current) {
      sceneContainerRef.current.appendChild(app.view as unknown as Node);
      const baseTexture = PIXI.BaseTexture.from("assets/assets_candy.png");
      const frameSize = 100;
      const candy_textures = candy_texture_defs.map((c) => {
        const rect = new PIXI.Rectangle(c.x, c.y, frameSize, frameSize);
        const texture = new PIXI.Texture(baseTexture, rect);
        return { id: c.id, texture };
      });

      setCandyTextures(candy_textures);
    }
    setScene(app);
    return () => {
      app.destroy(true);
    };
  }, [width, height]);
  const render = useMemo(() => {
    return <div ref={sceneContainerRef} style={{ width, height, backgroundColor: "transparent" }}></div>;
  }, []);
  return <>{render}</>;
  // return <div ref={sceneContainerRef} style={{ width, height }}></div>;
};

export default AnimatePlay;

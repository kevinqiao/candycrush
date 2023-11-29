import { useEffect, useRef } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { useBattleManager } from "../../service/BattleManager";
import { useSceneManager } from "../../service/SceneManager";
import useDimension from "../../util/useDimension";
import { ANIMATE_NAME } from "../animation/AnimateConstants";
import { useAnimateManager } from "../animation/AnimateManager";
import { AnimateElement } from "../animation/AnimationManager";

const SearchOpponent = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const foundRef = useRef<HTMLDivElement | null>(null);
  const vsRef = useRef<HTMLDivElement | null>(null);
  const { scenes, stageScene } = useSceneManager();
  const { width, height } = useDimension(sceneContainerRef);
  const { battle } = useBattleManager();
  const { createAnimate } = useAnimateManager();

  useEffect(() => {
    if (searchRef.current && vsRef.current && foundRef.current && sceneContainerRef.current) {
      const sceneEle: AnimateElement = { name: "scene", type: 0, ele: sceneContainerRef.current };
      const searchEle: AnimateElement = { name: "search", type: 0, ele: searchRef.current };
      const vsEle: AnimateElement = { name: "versus", type: 0, ele: vsRef.current };
      const foundEle: AnimateElement = { name: "found", type: 0, ele: foundRef.current };
      const eles: AnimateElement[] = [sceneEle, searchEle, foundEle, vsEle];
      createAnimate({ name: ANIMATE_NAME.BATTLE_SEARCH, eles });
    }
  }, []);

  useEffect(() => {
    if (battle) {
      setTimeout(() => createAnimate({ name: ANIMATE_NAME.BATTLE_MATCHED, data: battle }), 5000);
    }
  }, [battle]);
  useEffect(() => {
    if (sceneContainerRef.current) {
      const scene = scenes.get(SCENE_NAME.BATTLE_MATCHING);
      if (!scene && width > 0 && height > 0) {
        const scene = {
          app: sceneContainerRef.current,
          x: 0,
          y: 0,
          width: width,
          height: height,
          type: 1,
        };
        scenes.set(SCENE_NAME.BATTLE_MATCHING, scene);
        stageScene(SCENE_NAME.BATTLE_MATCHING, sceneContainerRef.current);
      }
    }
    return () => {
      scenes.delete(SCENE_NAME.BATTLE_MATCHING);
    };
  }, [sceneContainerRef, scenes, width, height]);

  return (
    <div
      ref={sceneContainerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        visibility: "visible",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        color: "white",
        backgroundColor: "red",
        pointerEvents: "none",
      }}
    >
      <div
        ref={vsRef}
        style={{
          opacity: 0,
          position: "absolute",
          top: height * 0.6,
          left: 0,
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <span style={{ fontSize: 20 }}>VS</span>
      </div>
      <div
        ref={searchRef}
        style={{
          position: "absolute",
          top: height * 0.6,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 20 }}>Searching...</span>
      </div>
      <div
        ref={foundRef}
        style={{
          opacity: 0,
          position: "absolute",
          top: height * 0.7,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 20 }}>Opponent Found</span>
      </div>
    </div>
  );
};

export default SearchOpponent;

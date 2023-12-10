import { useEffect, useRef } from "react";
import { SCENE_NAME } from "../../model/Constants";
import { useSceneManager } from "../../service/SceneManager";
import useDimension from "../../util/useDimension";
import Avatar from "./common/Avatar";

const SearchOpponent = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const foundRef = useRef<HTMLDivElement | null>(null);
  const vsRef = useRef<HTMLDivElement | null>(null);
  const playerAvatarRef = useRef<HTMLDivElement | null>(null);
  const opponentAvatarRef = useRef<HTMLDivElement | null>(null);
  const { scenes, stageScene } = useSceneManager();
  const { width, height } = useDimension(sceneContainerRef);

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
          searchTxTEle: searchRef.current,
          vsEle: vsRef.current,
          foundTxTEle: foundRef.current,
          playerAvatarEle: playerAvatarRef.current,
          opponentAvatarEle: opponentAvatarRef.current,
        };
        stageScene(SCENE_NAME.BATTLE_MATCHING, scene);
      }
    }
    return () => {
      scenes.delete(SCENE_NAME.BATTLE_MATCHING);
    };
  }, [sceneContainerRef, searchRef, vsRef, foundRef, scenes, width, height, stageScene]);

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
        ref={playerAvatarRef}
        style={{
          opacity: 0,
          position: "absolute",
          top: height * 0.4,
          left: -80,
          width: 80,
          height: 80,
        }}
      >
        <Avatar />
      </div>
      <div
        ref={opponentAvatarRef}
        style={{
          opacity: 0,
          position: "absolute",
          top: height * 0.4,
          left: width,
          width: 80,
          height: 80,
        }}
      >
        <Avatar />
      </div>
      <div
        ref={vsRef}
        style={{
          opacity: 0,
          position: "absolute",
          top: height * 0.4 + 40,
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

import { SCENE_NAME } from "model/Match3Constants";
import React, { useCallback, useMemo } from "react";
import { useBattleManager } from "service/BattleManager";
import { useGameManager } from "service/GameManager";
import { useSceneManager } from "service/SceneManager";
import { CircularProgressButton } from "./CircularProgressButton";

const SkillControl: React.FC = () => {
  const { containerBound, scenes } = useSceneManager();
  const { game } = useGameManager();
  const { currentSkill, setCurrentSkill } = useBattleManager();
  const skillBound = useMemo(() => {
    if (game && scenes) {
      const gameScenes = scenes.get(SCENE_NAME.GAME_SCENES);
      const gameScene = gameScenes.find((s) => s.gameId === game.gameId);
      if (gameScene) {
        return { top: gameScene.y + gameScene.height + 20, left: gameScene.x, width: gameScene.width, height: 60 };
      }
    }
    return null;
  }, [game, scenes, containerBound]);
  const noteBound = useMemo(() => {
    if (game && scenes) {
      const gameScenes = scenes.get(SCENE_NAME.GAME_SCENES);
      const gameScene = gameScenes.find((s) => s.gameId === game.gameId);
      if (gameScene) {
        return { top: gameScene.y - 80, left: gameScene.x, width: gameScene.width, height: 80 };
      }
    }
    return null;
  }, [game, scenes, containerBound]);

  const toggleSkill = useCallback(
    (s: number) => {
      if (s === 0 || s === currentSkill) setCurrentSkill(0);
      else if (currentSkill === 0) {
        setCurrentSkill(s);
      }
    },
    [currentSkill]
  );

  return (
    <>
      {currentSkill && skillBound ? (
        <div
          style={{
            position: "absolute",
            zIndex: 120,
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.6,
            backgroundColor: "black",
          }}
          onClick={() => toggleSkill(0)}
        ></div>
      ) : null}
      {currentSkill && noteBound ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            position: "absolute",
            zIndex: 150,
            top: noteBound.top,
            left: noteBound.left,
            width: noteBound.width,
            height: noteBound.height,
            color: "white",
          }}
        >
          choose a candy to remove
        </div>
      ) : null}
      {skillBound ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            position: "absolute",
            zIndex: 150,
            top: skillBound.top,
            left: skillBound.left,
            width: skillBound.width,
            height: skillBound.height + 30,
            backgroundColor: "transparent",
          }}
        >
          <CircularProgressButton skill={1} onClick={() => toggleSkill(1)} />
          <CircularProgressButton skill={2} onClick={() => toggleSkill(2)} />
          <CircularProgressButton skill={3} onClick={() => toggleSkill(3)} />
        </div>
      ) : null}
    </>
  );
};

export default SkillControl;

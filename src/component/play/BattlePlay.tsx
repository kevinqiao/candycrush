import { GameProvider } from "../../service/GameManager";
import { useSceneManager } from "../../service/SceneManager";
import AnimatePlay from "../animation/AnimatePlay";
import GamePlay from "./GamePlay";
import BattleConsole from "./console/BattleConsole";

const BattlePlay = () => {
  const { consoleScene, gameScenes, animateScene } = useSceneManager();
  return (
    <>
      {consoleScene ? (
        <div
          style={{
            position: "absolute",
            top: consoleScene.y,
            left: consoleScene.x,
            width: consoleScene.width,
            height: consoleScene.height,
          }}
        >
          <BattleConsole scene={consoleScene} />
        </div>
      ) : null}

      {Array.from(gameScenes.keys()).map((gameId) => {
        const scene = gameScenes.get(gameId);
        if (scene)
          return (
            <GameProvider gameId={gameId} isReplay={false} pid={"origin"}>
              <div
                key={"b2"}
                style={{
                  position: "absolute",
                  top: scene.y,
                  left: scene.x,
                  width: scene.width,
                  height: scene.height,
                  backgroundColor: "transparent",
                }}
              >
                <GamePlay scene={scene} />
              </div>
            </GameProvider>
          );
      })}

      {animateScene ? (
        <div
          key={"a2"}
          style={{
            position: "absolute",
            top: animateScene.y,
            left: animateScene.x,
            height: animateScene.height,
            width: animateScene.width,
            backgroundColor: "transparent",
            pointerEvents: "none",
          }}
        >
          <AnimatePlay scene={animateScene} />
        </div>
      ) : null}
    </>
  );
};

export default BattlePlay;

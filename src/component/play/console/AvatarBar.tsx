import React, { useCallback, useRef } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { ConsoleScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import useDimension from "../../../util/useDimension";
const frameSize = 185;
interface Props {
  layout: number;
  game: { uid: string; avatar?: number; gameId: string; data?: any };
}

const AvatarBar: React.FC<Props> = ({ layout, game }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useDimension(sceneContainerRef);
  const { scenes } = useSceneManager();

  const calculateBackgroundPosition = () => {
    const x = 45;
    const y = frameSize + 125;
    const pos = `-${x}px -${y}px`;
    return pos;
  };

  const avatarSheetStyle = {
    width: frameSize,
    height: frameSize,
    backgroundImage: `url("../../../assets/avatar.png")`,
    backgroundSize: "auto",
    backgroundPosition: calculateBackgroundPosition(),
    backgroundColor: "transparent",
    transform: `scale(${height / frameSize},${height / frameSize})`,
    transformOrigin: "top left",
  };
  const load = useCallback(
    (type: number, el: HTMLElement | null) => {
      if (scenes && el && game) {
        // let game = battle.games.find((g) => g.uid === user.uid);
        // if (layout > 0) {
        //   const gs = battle?.games.filter((g) => g.uid !== user.uid);
        //   if (gs.length > 0) {
        //     game = gs[0];
        //   }
        // }
        // console.log("layout:" + layout);
        const consoleScene = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;

        if (consoleScene && game?.gameId) {
          // setBattleGame(game);
          const gameId = game.gameId;
          if (!consoleScene.avatarBars) consoleScene.avatarBars = [];
          let avatarBar = consoleScene.avatarBars.find((a) => a.gameId === gameId);
          if (!avatarBar) {
            avatarBar = { gameId: game.gameId, avatar: null, bar: null, score: null, plus: null };
            consoleScene.avatarBars.push(avatarBar);
          }

          switch (type) {
            case 0:
              avatarBar.avatar = el;
              break;
            case 1:
              avatarBar.bar = el;
              break;
            case 2:
              avatarBar.score = el;
              break;
            case 3:
              avatarBar.plus = el;
              break;
            default:
              break;
          }
        }
      }
    },
    [scenes, game]
  );

  return (
    <div
      ref={sceneContainerRef}
      style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "transparent" }}
    >
      <div
        ref={(el) => load(1, el)}
        style={{
          display: "flex",
          justifyContent: layout === 0 ? "flex-end" : "flex-start",
          position: "absolute",
          top: height * 0.2,
          left: layout === 0 ? height * 0.5 : 0,
          width: width - height * 0.5,
          height: height * 0.6,
          backgroundColor: "red",
          borderRadius: 5,
        }}
      >
        <div style={{ position: "relative", top: 0, left: 0 }}>
          <span ref={(el) => load(2, el)}>0</span>
        </div>
        <div
          ref={(el) => load(3, el)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            color: "white",
          }}
        ></div>
      </div>
      <div ref={(el) => load(0, el)} style={{ position: "absolute", top: 0, left: layout === 0 ? 0 : width - height }}>
        <div style={avatarSheetStyle}></div>
      </div>
    </div>
  );
};

export default AvatarBar;

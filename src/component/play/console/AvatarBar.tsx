import { useCallback, useRef } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { ConsoleScene } from "../../../model/SceneModel";
import { countBaseScore } from "../../../service/GameEngine";
import { useSceneManager } from "../../../service/SceneManager";
import useDimension from "../../../util/useDimension";
const frameSize = 185;
interface Props {
  layout: number;
  game: { uid: string; avatar?: number; gameId: string; matched: { asset: number; quantity: number }[] };
}
const layout = {
  LEFT: 0,
  RIGHT: 1,
};
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
    backgroundImage: `url("assets/avatar.png")`,
    backgroundSize: "auto",
    backgroundPosition: calculateBackgroundPosition(),
    backgroundColor: "transparent",
    transform: `scale(${height / frameSize},${height / frameSize})`,
    transformOrigin: "top left",
  };
  const load = useCallback(
    (type: number, el: HTMLElement | null) => {
      if (scenes && game && el && layout === 0) {
        const consoleScene = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
        if (consoleScene) {
          if (!consoleScene.avatarBars) consoleScene.avatarBars = [];
          let avatarBar = consoleScene.avatarBars.find((a) => a.gameId === game.gameId);
          if (!avatarBar) {
            avatarBar = { gameId: game.gameId, avatar: null, bar: null, score: null };
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
            default:
              break;
          }
        }
      }
    },
    [game, scenes]
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
          backgroundColor: "white",
          borderRadius: 5,
        }}
      >
        <span ref={(el) => load(2, el)} id={layout === 0 ? game.gameId + "score" : "score"}>
          <span>{countBaseScore(game.matched)}</span>
        </span>
      </div>
      <div ref={(el) => load(0, el)} style={{ position: "absolute", top: 0, left: layout === 0 ? 0 : width - height }}>
        <div style={avatarSheetStyle}></div>
      </div>
    </div>
  );
};

export default AvatarBar;

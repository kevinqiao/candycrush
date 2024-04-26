import React, { useCallback, useEffect, useRef, useState } from "react";
import { SCENE_NAME } from "../../../model/Constants";
import { ConsoleScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";
import * as GameUtils from "../../../util/MatchGameUtils";
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
  const [score, setScore] = useState<number>(0);

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
  const getAvatarBar = useCallback(() => {
    if (!game || !scenes) return;

    const consoleScene = scenes.get(SCENE_NAME.BATTLE_CONSOLE) as ConsoleScene;
    let avatarBar;

    if (consoleScene && game?.gameId) {
      // setBattleGame(game);
      const gameId = game.gameId;
      if (!consoleScene.avatarBars) consoleScene.avatarBars = [];
      avatarBar = consoleScene.avatarBars.find((a) => a.gameId === gameId);
      if (!avatarBar) {
        avatarBar = { gameId: game.gameId, avatar: null, bar: null, score: null, plus: null };
        consoleScene.avatarBars.push(avatarBar);
      }
    }
    return avatarBar;
  }, [game, scenes]);

  const loadAvatar = useCallback(
    (el: HTMLElement | null) => {
      if (el) {
        const avatarBar = getAvatarBar();
        if (avatarBar) {
          avatarBar.avatar = el;
        }
      }
    },
    [game, scenes]
  );
  const loadBar = useCallback(
    (el: HTMLElement | null) => {
      if (el) {
        const avatarBar = getAvatarBar();
        if (avatarBar) avatarBar.bar = el;
      }
    },
    [game, scenes]
  );
  const loadScore = useCallback(
    (el: HTMLElement | null) => {
      if (el) {
        const avatarBar = getAvatarBar();
        if (avatarBar) avatarBar.score = el;
      }
    },
    [game, scenes]
  );
  const loadPlus = useCallback(
    (el: HTMLElement | null) => {
      if (el) {
        const avatarBar = getAvatarBar();
        if (avatarBar) avatarBar.plus = el;
      }
    },
    [game, scenes]
  );

  useEffect(() => {
    if (game) {
      const s = GameUtils.countBaseScore(game.data.matched);
      setScore(s);
    }
  }, [game]);

  return (
    <div
      ref={sceneContainerRef}
      style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "transparent" }}
    >
      <div
        ref={loadBar}
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
          <span ref={loadScore}>{score}</span>
        </div>
        <div
          ref={loadPlus}
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
      <div ref={loadAvatar} style={{ position: "absolute", top: 0, left: layout === 0 ? 0 : width - height }}>
        <div style={avatarSheetStyle}></div>
      </div>
    </div>
  );
};

export default AvatarBar;

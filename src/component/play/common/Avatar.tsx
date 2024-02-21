import React, { useRef } from "react";
import useDimension from "../../../util/useDimension";
const frameSize = 65;
interface Props {
  player: { uid: string; name: string; avatar?: number };
}
const Avatar: React.FC<Props> = ({ player }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useDimension(sceneContainerRef);

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
  const avatarcss = {
    width: frameSize,
    height: frameSize,
    backgroundImage: `url("avatars/${player.avatar}.svg")`,
    backgroundSize: "cover",
  };
  return (
    <div ref={sceneContainerRef} style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}>
      {/* <div style={avatarSheetStyle}></div> */}
      {player ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={avatarcss}></div>
          <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: "auto" }}>{player.name}</div>
        </div>
      ) : null}
    </div>
  );
};

export default Avatar;

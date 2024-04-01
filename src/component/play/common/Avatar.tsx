import React, { useRef } from "react";
const frameSize = 65;
interface Props {
  player: { uid: string; name: string; avatar?: number };
}
const Avatar: React.FC<Props> = ({ player }) => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
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

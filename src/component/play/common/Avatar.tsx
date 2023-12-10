import { useEffect, useRef } from "react";
import useDimension from "../../../util/useDimension";
const frameSize = 185;
const Avatar: React.FC = () => {
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useDimension(sceneContainerRef);

  useEffect(() => {}, []);
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
  return (
    <div ref={sceneContainerRef} style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}>
      <div style={avatarSheetStyle}></div>
    </div>
  );
};

export default Avatar;

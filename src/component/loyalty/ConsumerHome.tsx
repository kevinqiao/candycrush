import React, { useRef } from "react";
import useDimension from "util/useDimension";
import PageProps from "../../model/PageProps";

const ConsumerHome: React.FC<PageProps> = (pageProp) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pagePosition = useDimension(sceneRef);

  return (
    <>
      <div ref={sceneRef} className="play_container"></div>
    </>
  );
};
export default ConsumerHome;

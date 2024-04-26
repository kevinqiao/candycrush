import React, { useCallback, useMemo } from "react";
import { useBattleManager } from "service/BattleManager";
import { CircularProgressButton } from "./CircularProgressButton";

const SkillControl: React.FC = () => {
  const { currentSkill, setCurrentSkill, bounds } = useBattleManager();
  const bound = useMemo(() => {
    if (bounds) {
      const b = bounds.find((b) => b.name === "player");
      if (b) {
        return { top: b.top + b.height + 20, left: b.left, width: b.width, height: 60 };
      }
    }
    return null;
  }, [bounds]);
  const note = useMemo(() => {
    if (bounds) {
      const b = bounds.find((b) => b.name === "player");
      if (b) {
        return { top: b.top - 80, left: b.left, width: b.width, height: 80 };
      }
    }
    return null;
  }, [bounds]);

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
      {currentSkill && bound ? (
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
      {currentSkill && note ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            position: "absolute",
            zIndex: 150,
            top: note.top,
            left: note.left,
            width: note.width,
            height: note.height,
            color: "white",
          }}
        >
          choose a candy to remove
        </div>
      ) : null}
      {bound ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            position: "absolute",
            zIndex: 150,
            top: bound.top,
            left: bound.left,
            width: bound.width,
            height: bound.height + 30,
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

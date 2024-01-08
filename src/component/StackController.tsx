import { useMemo } from "react";
import StackPop from "./StackPop";
import "./layout.css";

const StackController = () => {
  const render = useMemo(() => {
    return (
      <div>
        {["l0", "l1", "l2"].map((p, index) => (
          <StackPop key={"stack-" + p} zIndex={(index + 1) * 200} index={index}></StackPop>
        ))}
      </div>
    );
  }, []);
  return <>{render}</>;
};
export default StackController;

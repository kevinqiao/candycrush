import { forwardRef, useMemo } from "react";
import { usePageManager } from "service/PageManager";
import StackPop from "./StackPop";
import "./layout.css";

const StackController: React.FC = forwardRef((props, ref) => {
  const { stacks } = usePageManager();
  const render = useMemo(() => {
    return (
      <div>
        {stacks.map((p, index) => (
          <StackPop key={"stack-" + p.name} zIndex={(index + 1) * 200} index={index}></StackPop>
        ))}
      </div>
    );
  }, [stacks]);
  return <>{render}</>;
});
export default StackController;

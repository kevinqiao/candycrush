import { StackPages } from "../model/PageCfg";
import { PagePosition } from "../model/PageProps";
import useCoord from "../service/CoordManager";
import { usePageManager } from "../service/PageManager";
import StackPop from "./StackPop";
import "./layout.css";
import { useCallback } from "react";

const StackController = () => {

  const { stacks } = usePageManager();
  return (
    <>
      {stacks.map((p, index) => {
        // const position: PagePosition | null = getPosition(p.name);
        // if (position) {
        //   const config = StackPages.find((s) => s.name === p.name);
        //   const pageProp = { name: p.name, position, data: p.data, config };
          return <StackPop key={p.name + index + "stack"} zIndex={(index + 1) * 200} page={p}></StackPop>;
        // }
      })}
    </>
  );
};

export default StackController;

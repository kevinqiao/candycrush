import { StackPages } from "../model/PageCfg";
import { PagePosition } from "../model/PageProps";
import useCoord from "../service/CoordManager";
import { usePageManager } from "../service/PageManager";
import StackPop from "./StackPop";
import "./layout.css";

const StackController = () => {
  const { width, height } = useCoord();
  const { stacks } = usePageManager();

  const getPosition = (pname: string) => {
    const pageCfg = StackPages.find((s) => s.name === pname);
    if (pageCfg) {
      const w = pageCfg.width <= 1 ? width * pageCfg.width : pageCfg.width;
      const h = pageCfg.height <= 1 ? height * pageCfg.height : pageCfg.height;
      const position = { top: 0, left: 0, width: w, height: h, direction: pageCfg.direction };
      return position;
    }
    return null;
  };

  return (
    <>
      {stacks.map((p, index) => {
        const position: PagePosition | null = getPosition(p.name);
        if (position) {
          const config = StackPages.find((s) => s.name === p.name);
          const pageProp = { name: p.name, position, data: p.data, config };
          return <StackPop key={p.name + index + "stack"} zIndex={(index + 1) * 200} pageProp={pageProp}></StackPop>;
        }
      })}
    </>
  );
};

export default StackController;

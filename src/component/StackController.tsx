import { FunctionComponent, Suspense, lazy, useCallback, useEffect, useState } from "react";
import { StackPages } from "../model/PageCfg";
import PageProps, { PagePosition } from "../model/PageProps";
import useCoord from "../service/CoordManager";
import { usePageManager } from "../service/PageManager";
import StackPop from "./StackPop";
import "./layout.css";

const StackController = () => {
  const { width, height } = useCoord();
  const [components, setComponents] = useState<{ name: string; component: any }[]>();
  const { stacks } = usePageManager();

  useEffect(() => {
    const pages = StackPages.map((p) => {
      const c = lazy(() => import(`${p.uri}`));
      return { name: p.name, component: c };
    });
    if (pages?.length > 0) {
      setComponents(pages);
    }
  }, []);
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
  const renderPage = useCallback(
    (pageProp: PageProps) => {
      if (pageProp) {
        const p = components?.find((p) => p.name === pageProp.name);
        if (p) {
          const loading = (
            <div
              style={{
                margin: 0,
                border: 0,
                top: pageProp.position?.top,
                left: pageProp.position?.left,
                width: pageProp.position?.width,
                height: pageProp.position?.height,
                backgroundColor: "white",
                pointerEvents: "none",
              }}
            >
              Loading
            </div>
          );
          const SelectedComponent: FunctionComponent<PageProps> = p.component;
          return (
            <Suspense fallback={<div>Loading</div>}>
              <SelectedComponent
                name={pageProp.name}
                data={pageProp.data}
                position={pageProp.position}
                config={pageProp.config}
              />
            </Suspense>
          );
        }
      }
    },
    [components]
  );

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

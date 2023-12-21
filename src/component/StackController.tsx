import { FunctionComponent, Suspense, lazy, useCallback, useEffect, useState } from "react";
import StackPop from "../common/StackPop";
import { StackPages } from "../model/PageCfg";
import PageProps from "../model/PageProps";
import useCoord from "../service/CoordManager";
import { usePageManager } from "../service/PageManager";
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
    (page: any, position: any) => {
      if (page) {
        const p = components?.find((p) => p.name === page.name);
        if (p) {
          const loading = (
            <div
              style={{
                margin: 0,
                border: 0,
                top: position?.top,
                left: position?.left,
                width: position?.width,
                height: position?.height,
                backgroundColor: "white",
              }}
            >
              Loading
            </div>
          );
          const SelectedComponent: FunctionComponent<PageProps> = p.component;
          return (
            <Suspense fallback={loading}>
              <SelectedComponent data={page.data} position={position} />
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
        const position = getPosition(p.name);
        if (position)
          return (
            <StackPop key={p.name + index + "stack"} page={p.name} zIndex={(index + 1) * 2000} position={position}>
              {renderPage(p, position)}
            </StackPop>
          );
      })}
    </>
  );
};

export default StackController;

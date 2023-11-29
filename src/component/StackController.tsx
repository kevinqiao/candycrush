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
  const { stacks, popPage } = usePageManager();
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
      const position = { page: pname, top: 0, left: 0, width: w, height: h, direction: pageCfg.direction };
      return position;
    }
    return null;
  };
  const renderPage = useCallback(
    (page: any) => {
      if (page) {
        const p = components?.find((p) => p.name === page.name);
        if (p) {
          const SelectedComponent: FunctionComponent<PageProps> = p.component;
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <SelectedComponent data={page.data} />
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
        return (
          <StackPop key={p.name + "stack"} page={p.name} zIndex={(index + 1) * 200} position={position}>
            {renderPage(p)}
          </StackPop>
        );
      })}
    </>
  );
};

export default StackController;

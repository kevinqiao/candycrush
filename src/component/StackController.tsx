import { FunctionComponent, Suspense, lazy, useCallback, useEffect, useState } from "react";
import StackPop from "../common/StackPop";
import { StackPages } from "../model/PageCfg";
import PageProps from "../model/PageProps";
import { usePageManager } from "../service/PageManager";
import "./layout.css";

const StackController = () => {
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
      {stacks.map((p, index) => (
        <StackPop
          key={p.name + "stack"}
          zIndex={(index + 1) * 200}
          render={(togglePopup) => {
            return (
              <div style={{ height: "100vh", backgroundColor: "blue" }}>
                <div
                  className="closePopBtn"
                  onClick={() => {
                    togglePopup();
                    setTimeout(() => popPage([p.name]), 400);
                  }}
                >
                  Cancel
                </div>
                {renderPage(p)}
              </div>
            );
          }}
        />
      ))}
    </>
  );
};

export default StackController;

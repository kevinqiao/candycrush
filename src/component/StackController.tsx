import { FunctionComponent, Suspense, lazy, useCallback, useEffect, useState } from "react";
import StackPop from "../common/StackPop";
import BattleModel from "../model/Battle";
import BattlePageProps from "../model/BattlePageProps";
import { StackPages } from "../model/PageCfg";
import { usePageManager } from "../service/PageManager";
import "./layout.css";

const StackController = () => {
  const [components, setComponents] = useState<{ name: string; component: any }[]>();
  const { stacks, popPage } = usePageManager();
  useEffect(() => {
    const pages = StackPages.map((p) => {
      console.log(p);
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
          const SelectedComponent: FunctionComponent<BattlePageProps> = p.component;
          const battle = page.data as BattleModel;
          console.log(battle);
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <SelectedComponent battle={battle} />
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

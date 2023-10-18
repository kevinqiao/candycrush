import { FunctionComponent, Suspense, lazy, useEffect, useMemo, useState } from "react";
import { NavContext, NavPages } from "../model/PageCfg";
import { usePageManager } from "../service/PageManager";
import "./layout.css";

const NavController = () => {
  const [context, setContext] = useState<{ name: string; uri: string }>();
  const { currentPage } = usePageManager();

  useEffect(() => {
    console.log(currentPage);
    if (currentPage) {
      const pcfg = NavPages.find((p) => p.name === currentPage.name);
      const ctx = NavContext.find((p) => p.name === pcfg?.context);
      if (ctx && ctx.name !== context?.name) {
        setContext(ctx);
      }
    }
  }, [currentPage]);
  const renderNav = useMemo(() => {
    if (context) {
      const SelectedContext: FunctionComponent = lazy(() => import(`${context.uri}`));
      return (
        <Suspense key={context.name} fallback={<div>Loading...</div>}>
          <SelectedContext />
        </Suspense>
      );
    }
  }, [context]);

  return <div style={{ width: "100vw", height: "100vh" }}>{renderNav}</div>;
};

export default NavController;

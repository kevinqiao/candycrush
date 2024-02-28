import { AppsConfiguration } from "model/PageConfiguration";
import PageProps, { PageConfig } from "model/PageProps";
import React, { FunctionComponent, Suspense, lazy, useEffect, useMemo, useState } from "react";
import { usePageManager } from "service/PageManager";
import "./popup.css";

const NavPage: React.FC = () => {
  const { currentPage } = usePageManager();
  const [pageProp, setPageProp] = useState<PageProps | null>(null);

  useEffect(() => {
    if (currentPage) {
      const app = AppsConfiguration.find((c) => c.context === currentPage.ctx);
      if (app?.navs) {
        const config: PageConfig | undefined = app.navs.find((s) => s.name === currentPage.name);
        // const config = NavPages.find((s) => s.name === currentPage.name);
        if (config) {
          const prop = { ...currentPage, config };
          if (!pageProp || currentPage.ctx !== pageProp.ctx || currentPage.name !== pageProp.name) {
            setPageProp(prop);
          }
        }
      }
    }
  }, [currentPage]);
  const render = useMemo(() => {
    if (pageProp?.config.path) {
      const SelectedComponent: FunctionComponent<PageProps> = lazy(() => import(`${pageProp.config.path}`));
      return (
        <Suspense
          fallback={
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "transparent",
              }}
            >
              Loading
            </div>
          }
        >
          <SelectedComponent {...pageProp} />
        </Suspense>
      );
    }
  }, [pageProp]);

  return <div style={{ backgroundColor: "transparent" }}>{render}</div>;
};

export default NavPage;

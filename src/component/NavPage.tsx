import { AppsConfiguration } from "model/PageConfiguration";
import PageProps, { PageConfig } from "model/PageProps";
import React, { FunctionComponent, Suspense, lazy, useEffect, useMemo, useState } from "react";
import { usePageManager } from "service/PageManager";
import { useUserManager } from "service/UserManager";
import "./popup.css";

const NavPage: React.FC = () => {
  const { user } = useUserManager();
  const { currentPage } = usePageManager();
  const [pageProp, setPageProp] = useState<PageProps | null>(null);

  useEffect(() => {
    console.log(currentPage);
    if (currentPage) {
      const app: any = AppsConfiguration.find((c) => c.context === currentPage.ctx);
      console.log(app);
      if (app?.navs) {
        const config: PageConfig | undefined = app.navs.find((s) => s.name === currentPage.name);
        console.log(config);
        // const config = NavPages.find((s) => s.name === currentPage.name);
        if (config) {
          const prop = { ...currentPage, config };
          if (!pageProp || currentPage.ctx !== pageProp.ctx || currentPage.name !== pageProp.name) {
            setPageProp(prop);
            // if (app.auth) openPage({ name: "signin", data: {} });
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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "blueviolet",
                color: "white",
              }}
            >
              <span>Loading</span>
            </div>
          }
        >
          <SelectedComponent {...pageProp} />
        </Suspense>
      );
    }
  }, [pageProp]);

  return <>{render}</>;
};

export default NavPage;

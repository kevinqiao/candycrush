import { AppsConfiguration } from "model/PageConfiguration";
import PageProps, { PageConfig } from "model/PageProps";
import React, { FunctionComponent, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { usePageManager } from "service/PageManager";
import { SlideNavProvider } from "./SlideNavManager";
import "./popup.css";

const NavPage: React.FC = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const { currentPage } = usePageManager();
  const [pageProp, setPageProp] = useState<PageProps | null>(null);

  useEffect(() => {
    if (currentPage && navRef.current) {
      // const app = AppsConfiguration[0];
      const app = AppsConfiguration.find((c) => c.context === currentPage.ctx);
      if (app?.navs) {
        const config: PageConfig | undefined = app.navs.find((s) => s.name === currentPage.name);
        // const config = NavPages.find((s) => s.name === currentPage.name);
        if (config) {
          const prop = { ...currentPage, config };
          console.log(prop);
          if (!pageProp) setPageProp(prop);
        }
      }
    }
  }, [currentPage]);
  const render = useMemo(() => {
    if (pageProp) {
      const SelectedComponent: FunctionComponent<PageProps> = lazy(() => import(`${pageProp.config.path}`));
      return (
        <Suspense
          fallback={<div style={{ width: "100vw", height: "100vh", backgroundColor: "transparent" }}>Loading</div>}
        >
          <SelectedComponent {...pageProp} />
        </Suspense>
      );
    }
  }, [pageProp]);
  return (
    <div ref={navRef} style={{ backgroundColor: "transparent" }}>
      {pageProp ? <SlideNavProvider pageProp={pageProp}>{render}</SlideNavProvider> : null}
    </div>
  );
};

export default NavPage;

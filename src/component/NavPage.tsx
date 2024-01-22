import { AppsConfiguration } from "model/PageConfiguration";
import PageProps, { PageConfig } from "model/PageProps";
import React, { FunctionComponent, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { usePageManager } from "service/PageManager";
import { SlideNavProvider } from "./SlideNavManager";
import "./popup.css";

const WithDynamicImport = ({ prop }: { prop: PageProps }) => {
  const initedRef = useRef<boolean>(false);
  const { currentPage } = usePageManager();
  const [pageEvent, setPageEvent] = useState<any>(null);

  useEffect(() => {
    if (currentPage && prop) {
      if (!initedRef.current) {
        initedRef.current = true;
      } else {
        Object.assign(prop, currentPage);
        setPageEvent({ type: 0, data: prop });
      }
    }
  }, [currentPage, prop]);

  const render = useMemo(() => {
    if (prop?.config.path) {
      const SelectedComponent: FunctionComponent<PageProps> = lazy(() => import(`${prop.config.path}`));
      return (
        <Suspense
          fallback={<div style={{ width: "100vw", height: "100vh", backgroundColor: "transparent" }}>Loading</div>}
        >
          <SelectedComponent {...prop} />
        </Suspense>
      );
    }
  }, [prop]);
  return (
    <>
      <SlideNavProvider pageProp={prop} pageEvent={pageEvent}>
        {render}
      </SlideNavProvider>{" "}
    </>
  );
};
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

  // const render = useMemo(() => {
  //   if (pageProp?.config.path) {
  //     const SelectedComponent: FunctionComponent<any> = WithDynamicImport(pageProp);
  //     return <SelectedComponent />;
  //     // const SelectedComponent: FunctionComponent<PageProps> = lazy(() => import(`${pageProp.config.path}`));
  //     // return (
  //     //   <Suspense
  //     //     fallback={<div style={{ width: "100vw", height: "100vh", backgroundColor: "transparent" }}>Loading</div>}
  //     //   >
  //     //     <SelectedComponent {...pageProp} />
  //     //   </Suspense>
  //     // );
  //   }
  // }, [pageProp]);
  return (
    <div style={{ backgroundColor: "transparent" }}>{pageProp ? <WithDynamicImport prop={pageProp} /> : null}</div>
  );
};

export default NavPage;

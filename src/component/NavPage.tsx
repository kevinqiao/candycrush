import React, { FunctionComponent, Suspense, lazy, useCallback, useRef, useState, useEffect } from "react";
import PageProps from "../model/PageProps";
import { SlideNavProvider } from "./SlideNavManager";
import "./popup.css";
import { PageItem } from "service/PageManager";
import { NavPages } from "model/PageCfg";
interface NavProps {
  // pageProp: PageProps | null;
  page:PageItem
}

const NavPage: React.FC<NavProps> = ({ page }) => {

  const navRef = useRef<HTMLDivElement>(null);
  const [pageProp, setPageProp] = useState<PageProps|null>(null)
  useEffect(()=>{
    if (page&&navRef.current) {
      const config = NavPages.find((s) => s.name === page.name);
      const {width, height} =navRef.current.getBoundingClientRect();
      const prop = { name: page.name, data: page.data, position:{width,height,direction:0},config };
      if(!pageProp)
         setPageProp(prop)
    }
  },[page])
  const render = useCallback(() => {
    if (pageProp) {
       const SelectedComponent: FunctionComponent<PageProps> = lazy(() => import(`${pageProp.config.uri}`));
      return (        
        <Suspense fallback={<div>Loading</div>}>
          <SelectedComponent {...pageProp} />
        </Suspense>      
      );
    }
  }, [pageProp]);
  return (
    <>
      <div
        ref={navRef}       
      >
         <SlideNavProvider>
        {render()}
        </SlideNavProvider>
      </div>
    </>
  );
};

export default NavPage;

import React, { FunctionComponent, Suspense, lazy, useCallback, useRef } from "react";
import PageProps from "../model/PageProps";
import { NavAnimateProvider } from "./NavAnimateManager";
import "./popup.css";
interface NavProps {
  pageProp: PageProps | null;
}

const NavPage: React.FC<NavProps> = ({ pageProp }) => {
  const navRef = useRef<HTMLDivElement>(null);
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
        style={{
          width: "100%",
          height: "100%",
        }}
      >
         <NavAnimateProvider>
        {render()}
        </NavAnimateProvider>
      </div>
    </>
  );
};

export default NavPage;

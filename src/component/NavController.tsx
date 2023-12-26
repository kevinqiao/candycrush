import { NavPages } from "model/PageCfg";
import { useMemo } from "react";
import { usePageManager } from "../service/PageManager";
import NavPage from "./NavPage";
import "./layout.css";

const NavController = () => {
  const { currentPage } = usePageManager();
  const render = useMemo(() => {
    if (currentPage) {
      const config = NavPages.find((s) => s.name === currentPage.name);
      const pageProp = { name: currentPage.name, data: currentPage.data, config };
      return <NavPage pageProp={pageProp}></NavPage>;
    }
  }, [currentPage]);

  return <div style={{ width: "100vw", height: "100vh" }}>{render}</div>;
};

export default NavController;

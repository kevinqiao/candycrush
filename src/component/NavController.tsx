import { NavPages } from "model/PageCfg";
import { useMemo } from "react";
import { usePageManager } from "../service/PageManager";
import NavPage from "./NavPage";
import "./layout.css";
import useCoord from "service/CoordManager";

const NavController = () => {
  // const {width,height} =useCoord();
  const { currentPage } = usePageManager();
  // const render = useMemo(() => {
  //   if (currentPage) {
  //     const config = NavPages.find((s) => s.name === currentPage.name);
  //     const pageProp = { name: currentPage.name, data: currentPage.data, config };
  //     return <NavPage pageProp={pageProp}></NavPage>;
  //   }
  // }, [currentPage,width,height]);

  return <div>{currentPage?<NavPage page={currentPage}></NavPage>:null}</div>;
};

export default NavController;

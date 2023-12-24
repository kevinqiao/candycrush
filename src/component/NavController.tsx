import { NavPages } from "model/PageCfg";
import { useMemo } from "react";
import { usePageManager } from "../service/PageManager";
import NavPage from "./NavPage";
import "./layout.css";

const NavController = () => {
  // const [context, setContext] = useState<{ name: string; uri: string }>();
  const { currentPage } = usePageManager();
  console.log(currentPage);
  // useEffect(() => {
  //   if (currentPage) {
  //     const pcfg = NavPages.find((p) => p.name === currentPage.name);
  //     const ctx = NavContext.find((p) => p.name === pcfg?.context);
  //     if (ctx && ctx.name !== context?.name) {
  //       setContext(ctx);
  //     }
  //   }
  // }, [currentPage]);
  // const renderNav = useMemo(() => {
  //   if (context) {
  //     const SelectedContext: FunctionComponent = lazy(() => import(`${context.uri}`));
  //     return (
  //       <Suspense key={context.name} fallback={<div>Loading...</div>}>
  //         <SelectedContext />
  //       </Suspense>
  //     );
  //   }
  // }, [context]);
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

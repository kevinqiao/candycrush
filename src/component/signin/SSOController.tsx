import React, { FunctionComponent, lazy, Suspense, useMemo } from "react";
import usePartnerManager from "service/PartnerManager";
import "./signin.css";
const SSOController: React.FC = () => {
  const { partner } = usePartnerManager();

  const render = useMemo(() => {
    if (partner && partner.auth.length > 0 && partner.auth[0].path) {
      const SelectedComponent: FunctionComponent = lazy(() => import(`${partner.auth[0].path}`));
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
          <SelectedComponent />
        </Suspense>
      );
    }
  }, [partner]);
  return (
    <div
      style={{
        position: "relative",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "white",
      }}
    >
      {render}
    </div>
  );
};

export default SSOController;

import PageProps from "model/PageProps";
import React, { useMemo } from "react";
import useCoord from "service/TerminalManager";
import { useUserManager } from "service/UserManager";

const OrderHome: React.FC<PageProps> = (prop) => {
  const { width, height } = useCoord();
  const { user } = useUserManager();
  const render = useMemo(() => {
    return <></>;
  }, [prop, user, height, width]);
  return <>{render}</>;
};

export default OrderHome;

import { useConvex } from "convex/react";
import { AppsConfiguration } from "model/PageConfiguration";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { api } from "../convex/_generated/api";
import useEventSubscriber from "./EventManager";
import { usePageManager } from "./PageManager";

interface IPartnerContext {
  app: { name: string; partnerId: number; host: string; channel: number } | null;
  partner: {
    name: string;
    host: string;
    pid: number;
    auth: { id: string; channel: number; name: string; path: string; data: any };
  } | null;
}
const PartnerContext = createContext<IPartnerContext>({
  app: null,
  partner: null,
});

export const PartnerProvider = ({ children }: { children: ReactNode }) => {
  const [app, setApp] = useState<{ name: string; partnerId: number; host: string; channel: number } | null>(null);
  const { currentPage } = usePageManager();
  const { createEvent } = useEventSubscriber([], ["alert"]);
  const [partner, setPartner] = useState<{
    name: string;
    host: string;
    pid: number;
    auth: { id: string; channel: number; name: string; path: string; data: any };
  } | null>(null);
  const convex = useConvex();
  console.log(app);
  useEffect(() => {
    // localStorage.removeItem("partner");
    if (currentPage) {
      console.log(currentPage);
      let partnerId = 0;
      let channel = 0;
      if (currentPage.params) {
        const { partner, c } = currentPage.params;
        partnerId = partner ? +partner : 0;
        channel = c ? +c : 0;
      }
      const p = localStorage.getItem("partner");
      if (partnerId > 0) {
        localStorage.setItem("partner", JSON.stringify({ partnerId, channel }));
      } else if (p !== null) {
        const d = JSON.parse(p);
        partnerId = d.partnerId;
      }
      const appConfig = AppsConfiguration.find((a) => a.name === currentPage.app);
      console.log(appConfig);
      if (
        appConfig &&
        (!app || app.host !== window.location.hostname || appConfig.name !== app.name || partnerId !== app.partnerId)
      ) {
        const appData = {
          name: appConfig.name,
          host: window.location.hostname,
          partnerId: partnerId ? +partnerId : 0,
          channel: channel ? +channel : 0,
        };
        setApp(appData);
      }
    }
  }, [currentPage]);
  useEffect(() => {
    const fetchPartner = async () => {
      if (!app) return;

      const { name, partnerId, host, channel } = app;
      const res = await convex.query(api.partner.find, {
        pid: partnerId,
        app: name,
        host,
        channelId: channel,
      });
      // console.log(res);
      if (res.ok) setPartner(res.message);
      else {
        createEvent({ name: "partnerNotExist", topic: "alert", data: "Partner Not Found", delay: 0 });
      }
    };
    fetchPartner();
  }, [app]);

  return <PartnerContext.Provider value={{ partner, app }}> {children} </PartnerContext.Provider>;
};

const usePartnerManager = () => {
  return useContext(PartnerContext);
};

export default usePartnerManager;

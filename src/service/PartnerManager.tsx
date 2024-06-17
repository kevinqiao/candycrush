import { useConvex } from "convex/react";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { api } from "../convex/_generated/api";

interface IPartnerContext {
  partner: { name: string; host: string; domain?: string; auth?: any } | null;
}
const PartnerContext = createContext<IPartnerContext>({
  partner: null,
});

export const PartnerProvider = ({ children }: { children: ReactNode }) => {
  const [partner, setPartner] = useState<{ name: string; host: string; domain?: string; auth?: any } | null>(null);
  const convex = useConvex();

  useEffect(() => {
    const fetchPartner = async () => {
      const host = window.location.hostname;
      console.log(host);
      const res = await convex.query(api.partner.findByHost, { host: "fungift" });
      console.log(res);
      if (res) setPartner(res);
    };
    fetchPartner();
  }, []);
  return <PartnerContext.Provider value={{ partner }}> {children} </PartnerContext.Provider>;
};

const usePartnerManager = () => {
  return useContext(PartnerContext);
};

export default usePartnerManager;

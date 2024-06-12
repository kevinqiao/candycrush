import { useConvex } from "convex/react";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { api } from "../convex/_generated/api";
interface IResourceContext {
  [k: string]: { [k: string]: string };
}
const ResourceContext = createContext<IResourceContext>({});

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [resources, setResources] = useState<{ [k: string]: { [k: string]: string } }>({});
  const [locale, setLocale] = useState(navigator.language);
  const convex = useConvex();
  useEffect(() => {
    const handleLanguageChange = () => {
      setLocale(navigator.language);
    };
    window.addEventListener("languagechange", handleLanguageChange);
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("languagechange", handleLanguageChange);
  }, []);
  useEffect(() => {
    const fetchResources = async (locale: string) => {
      const result: { [k: string]: { [k: string]: string } } = {};
      const res = await convex.query(api.localization.findByLocale, { locale });
      for (const r of res) {
        result[r.name] = r.data;
      }
      setResources(result);
    };
    if (locale) fetchResources("us_en");
  }, [locale]);
  return <ResourceContext.Provider value={resources}> {children} </ResourceContext.Provider>;
};
const useLocalization = () => {
  return useContext(ResourceContext);
};

export default useLocalization;

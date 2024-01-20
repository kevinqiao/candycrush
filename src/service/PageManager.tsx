import { AppsConfiguration, Covers } from "model/PageConfiguration";
import { PageConfig, PageItem } from "model/PageProps";
import React, { createContext, useCallback, useContext, useEffect } from "react";

export const PAGE_EVENT_NAME = {
  OPEN_PAGE: "open_page",
  CLOSE_PAGE: "close_page",
};
export interface PageEvent {
  name: string;
  page: string;
}

interface IPageContext {
  stacks: PageItem[];
  prevPage: PageItem | null;
  currentPage: PageItem | null;
  // pushPage: (p: PageItem) => void;
  popPage: (p: string[]) => void;
  openPage: (page: PageItem) => void;
}

const initialState = {
  stacks: [],
  prevPage: null,
  currentPage: null,
};

const actions = {
  APP_OPEN: "APP_OPEN",
  PAGE_CHANGE: "PAGE_CHANGE",
  PAGE_OPEN: "PAGE_OPEN",
  PAGE_LEFT: "PAGE_LEFT",
  PAGE_PUSH: "PAGE_PUSH",
  PAGE_POP: "PAGE_POP",
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case actions.PAGE_PUSH:
      const item = action.data;
      const stacks = [...state.stacks, item];
      return Object.assign({}, state, { stacks });
    case actions.PAGE_POP:
      if (action.data.length === 0) return Object.assign({}, state, { stacks: [] });
      else {
        const ps = state.stacks.filter((p: PageItem) => !action.data.includes(p.name));
        return Object.assign({}, state, { stacks: ps });
      }
    case actions.PAGE_CHANGE:
      return Object.assign({}, state, {
        prevPage: state.currentPage,
        currentPage: action.data,
      });
    case actions.APP_OPEN:
      const res = action.data;
      if (res.navItem) {
        const obj = { currentPage: res.navItem, stacks: res.stackItems ?? [] };
        return Object.assign({}, state, obj);
      } else return state;
    case actions.PAGE_OPEN:
      const page = action.data;
      if (!page.ctx) {
        const cover = Covers.find((c) => c.name === page.name);
        return Object.assign({}, state, { stacks: [...state.stacks, cover] });
      } else {
        const app = AppsConfiguration.find((a) => a.context === page.ctx);
        if (app) {
          let cfg = app.navs.find((p) => p.name === page.name);
          if (cfg) {
            const obj = Object.assign({}, state, { currentPage: page });
            if (page.cover) {
              const c = Covers.find((c) => c.name === page.cover.name);
              if (c) Object.assign(obj, { stacks: [...obj.stacks, c] });
            }
            return obj;
          } else {
            const sc = app.stacks.find((p) => p.name === page.name);
            if (!sc) return state;
            return Object.assign({}, state, { stacks: [...state.stacks, sc] });
          }
        }
      }
      break;
    default:
      return state;
  }
};

const parseURL = (location: any): { navItem?: PageItem; stackItems?: PageItem[] } => {
  const res: any = {};
  const navItem: any = {};
  const ps = location.pathname.split("/");
  let app = AppsConfiguration.find((a) => a.context === ps[1]);
  if (!app) {
    app = AppsConfiguration.find((a) => a.context === "/" || a.context === "");
  }
  if (app) {
    const uri = location.pathname.substring(ps[1].length + 1);
    if (uri) {
      const navCfg = app.navs.find((nav) => uri.includes(nav.uri));
      if (navCfg) {
        navItem["ctx"] = app.context;
        navItem.name = navCfg.name;
        res.navItem = navItem;
        const pos = uri.lastIndexOf(navCfg.uri) + navCfg.uri.length;
        const sub = uri.substring(pos + 1);
        if (navCfg.children && sub) {
          const child = navCfg.children.find((c) => c.uri === sub);
          if (child) navItem.child = child.name;
        }
        if (location.search) {
          const searchParams = new URLSearchParams(location.search);
          const params: { [key: string]: string } = {};
          for (let param of searchParams) {
            params[param[0]] = param[1];
          }
          navItem.params = params;
        }
        if (location.hash) {
          if (location.hash.includes("@")) {
            const stackItems = [];
            const hs = location.hash.split("@");
            navItem.anchor = hs[0];
            for (let i = 1; i < hs.length; i++) {
              const stackCfg = app.stacks.find((s) => s.name === hs[i]);
              if (stackCfg) {
                stackItems.push({ name: stackCfg.name, ctx: app.context });
              } else {
                const cover = Covers.find((c) => c.name === hs[i]);
                if (cover) stackItems.push({ name: cover.name });
              }
            }
            res.stackItems = stackItems;
          } else navItem.anchor = location.hash;
        }
      }
    }
  }

  return res;
};
const buildAppURL = (navItem: PageItem, stackItems: PageItem[]): string | null => {
  let url = buildNavURL(navItem);
  if (url && stackItems.length > 0) {
    url = url + "#";
    for (let stackItem of stackItems) {
      url = url + "@" + stackItem.name;
    }
    return url;
  }
  return null;
};
const buildNavURL = (pageItem: PageItem): string | null => {
  const app = AppsConfiguration.find((a) => a.context === pageItem.ctx);
  if (app) {
    let url = "/" + app.context;
    const nav = app.navs.find((nav) => nav.name === pageItem.name);
    if (nav) {
      url = url + nav.uri;
      if (pageItem.child) {
        const child = nav.children.find((c) => c.name === pageItem.child);
        if (child) url = url + child.uri;
      }
    }
    return url;
  }
  return null;
};
const buildStackURL = (pageItem: PageItem): string | null => {
  if (pageItem.ctx) {
    const app = AppsConfiguration.find((a) => a.context === pageItem.ctx);
    if (app?.stacks) {
      const stack = app.stacks.find((s) => s.name === pageItem.name && !s.nohistory);
      if (stack) return window.location.href + "#@" + pageItem.name;
    }
  } else {
    const cover = Covers.find((c) => c.name === pageItem.name);
    if (cover) return window.location.href + "#@" + pageItem.name;
  }
  return null;
};
const PageContext = createContext<IPageContext>({
  stacks: [],
  prevPage: null,
  currentPage: null,
  // pushPage: (p: PageItem) => null,
  popPage: (p: string[]) => null,
  openPage: (p: PageItem) => null,
});

export const PageProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const openPage = useCallback(
    (page: PageItem) => {
      const hash = window.location.hash;
      if (hash && hash.lastIndexOf(page.name) > 0) return;
      if (!page.ctx) {
        const cover: PageConfig | undefined = Covers.find((c) => c.name === page.name);
        if (cover) {
          dispatch({ type: actions.PAGE_PUSH, data: page });
          if (!cover.nohistory) {
            const url = buildStackURL(page);
            window.history.pushState({}, "", url);
          }
        }
      } else {
        const app = AppsConfiguration[0];
        let cfg: PageConfig | undefined = app.navs.find((p) => p.name === page.name);
        if (cfg) {
          if (cfg.nohistory) {
            const url = buildNavURL(page);
            window.history.pushState({}, "", url);
          }
          dispatch({ type: actions.PAGE_CHANGE, data: page });
        } else {
          const scfg: PageConfig | undefined = app.stacks.find((p) => p.name === page.name);
          if (scfg) {
            if (!scfg.nohistory) {
              const url = buildStackURL(page);
              window.history.pushState({ data: page.data }, "", url);
            }
            dispatch({ type: actions.PAGE_PUSH, data: page });
          }
        }
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const handlePopState = (event: any) => {
      console.log(event.state.data);
      console.log(window.location.href);
      const prop = parseURL(window.location);
      if (prop && Object.keys(prop).length > 0) {
        if (event.state.data && prop.stackItems) {
          const stack = prop.stackItems[prop.stackItems.length - 1];
          stack.data = event.state.data;
        }
        dispatch({ type: actions.APP_OPEN, data: prop });
      }
    };
    const prop = parseURL(window.location);
    if (prop && Object.keys(prop).length > 0) {
      console.log(prop);
      dispatch({ type: actions.APP_OPEN, data: prop });
    } else {
      console.log("open default page");
      openPage({ name: "playcenter", ctx: "match3", child: "tournamentHome" });
      window.history.replaceState({}, "", "/match3/playcenter/tournament/home");
    }
    // 监听popstate事件
    window.addEventListener("popstate", handlePopState);

    // 组件卸载时取消监听
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [openPage]);

  const value = {
    stacks: state.stacks,
    prevPage: state.prevPage,
    currentPage: state.currentPage,
    popPage: (pages: string[]) => {
      const hash = window.location.hash;
      if (hash) {
        const hs: string[] = hash.split("@");
        const nhash = hs.filter((h) => !pages.includes(h)).join("@");
        const url = window.location.pathname + window.location.search + (nhash !== "#" ? nhash : "");
        window.history.pushState({}, "", url);
      }
      dispatch({ type: actions.PAGE_POP, data: pages });
    },
    openPage,
  };
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export const usePageManager = () => {
  const ctx = useContext(PageContext);

  return { ...ctx };
};
export default PageProvider;

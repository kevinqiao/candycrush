import { AppsConfiguration, Covers } from "model/PageConfiguration";
import { PageConfig, PageItem } from "model/PageProps";
import React, { createContext, useCallback, useContext, useEffect } from "react";
import { buildNavURL, buildStackURL, parseURL } from "util/PageUtils";

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
    case actions.PAGE_PUSH: {
      const item = action.data;
      // eslint-disable-next-line no-case-declarations
      const stacks = [...state.stacks, item];
      return Object.assign({}, state, { stacks });
    }
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
    case actions.APP_OPEN: {
      const res = action.data;
      if (res.navItem) {
        // console.log(res);
        const obj = { currentPage: res.navItem, stacks: res.stackItems ?? [] };
        return Object.assign({}, state, obj);
      } else return state;
    }
    case actions.PAGE_OPEN:
      break;
    default:
      return state;
  }
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
        const cfg: PageConfig | undefined = app.navs.find((p) => p.name === page.name);
        if (cfg) {
          if (!cfg.nohistory) {
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
  const openApp = useCallback(
    (app: any) => {
      if (app["navItem"]) {
        if (app.stackItems && app.data) {
          const stack = app.stackItems[app.stackItems.length - 1];
          stack.data = app.data;
        }
        dispatch({ type: actions.APP_OPEN, data: app });
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const handlePopState = (event: any) => {
      const prop = parseURL(window.location);
      openApp(prop);
    };

    const prop = parseURL(window.location);
    console.log(prop);
    if (prop.ctx) {
      if (!prop["navItem"]) {
        prop.stackItems = undefined;
        const app: any = AppsConfiguration.find((a) => a.context === prop.ctx);
        if (app?.navs && app.navs.length > 0) {
          let uri = "/" + app.context + "/" + app.navs[0].uri;
          prop.navItem = { name: app.navs[0].name };
          prop.navItem.ctx = prop.ctx;
          if (app.navs[0]["children"]) {
            prop.navItem.child = app.navs[0].child ?? app.navs[0].children[0].name;
            const child: { name: string; path: string; uri: string } = app.navs[0].children.find(
              (c: any) => c.name === app.navs[0]["child"]
            );
            if (child) uri = uri + "/" + child.uri;
          }
          window.history.replaceState({}, "", uri);
        }
      }
      openApp(prop);
    } else {
      //open page not found
    }

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

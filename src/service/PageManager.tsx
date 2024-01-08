import React, { createContext, useCallback, useContext } from "react";
import { NavPages, StackPages } from "../model/PageCfg";
export interface PageConfig {
  name: string;
  uri: string;
  width?: number;
  height?: number;
  direction?: number;
  auth?: boolean;
}
export const PAGE_EVENT_NAME = {
  OPEN_PAGE: "open_page",
  CLOSE_PAGE: "close_page",
};
export interface PageEvent {
  name: string;
  page: string;
}
export interface PageItem {
  name: string;
  data?: any;
  isInitial?: boolean; //when app load, if need to init this page or not
}
interface IPageContext {
  stacks: PageItem[];
  prevPage: PageItem | null;
  currentPage: PageItem | null;
  pushPage: (p: PageItem) => void;
  popPage: (p: string[]) => void;
  openPage: (page: PageItem) => void;
}

const initialState = {
  stacks: [],
  prevPage: null,
  currentPage: { name: "playcenter", data: { isInitial: true } },
};

const actions = {
  PAGE_CHANGE: "PAGE_CHANGE",
  PAGE_RIGHT: "PAGE_RIGHT",
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
        currentPage: { ...action.data.page, isInitial: false },
      });
    default:
      return state;
  }
};

const PageContext = createContext<IPageContext>({
  stacks: [],
  prevPage: null,
  currentPage: null,
  pushPage: (p: PageItem) => null,
  popPage: (p: string[]) => null,
  openPage: () => null,
});

export const PageProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  console.log("page provider");
  const openPage = useCallback(
    (page: PageItem) => {
      let scfg: PageConfig | undefined = StackPages.find((p) => p.name === page.name);
      if (scfg) {
        dispatch({ type: actions.PAGE_PUSH, data: page });
      } else {
        let ncfg = NavPages.find((p) => p.name === page.name);
        if (ncfg) {
          let contextChanged = false;
          dispatch({ type: actions.PAGE_CHANGE, data: { page, contextChanged } });
        }
      }
    },
    [dispatch]
  );

  const value = {
    stacks: state.stacks,
    prevPage: state.prevPage,
    currentPage: state.currentPage,
    pushPage: useCallback(
      (page: PageItem) => {
        dispatch({ type: actions.PAGE_PUSH, data: page });
      },
      [dispatch]
    ),
    popPage: (pages: string[]) => {
      dispatch({ type: actions.PAGE_POP, data: pages });
    },
    openPage,
  };

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export const usePageManager = () => {
  const ctx = useContext(PageContext);
  const getPageProp = useCallback((page: PageItem, width: number, height: number) => {
    if (page) {
      const pageCfg = StackPages.find((s) => s.name === page.name);
      if (pageCfg) {
        const w = pageCfg.width <= 1 ? width * pageCfg.width : pageCfg.width;
        const h = pageCfg.height <= 1 ? height * pageCfg.height : pageCfg.height;
        const position = { width: w, height: h, direction: pageCfg.direction };
        const prop = { name: page.name, position, data: page.data, config: pageCfg };
        return prop;
      }
    }
  }, []);
  return { ...ctx, getPageProp };
};
export default PageProvider;

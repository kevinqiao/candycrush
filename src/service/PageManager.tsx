import React, { createContext, useCallback, useContext, useEffect } from "react";
import { NavPages, StackPages } from "../model/PageCfg";
import useEventSubscriber from "./EventManager";
import { useUserManager } from "./UserManager";
export interface PageConfig {
  name: string;
  uri: string;
  width?: number;
  height?: number;
  direction?: number;
  auth?: boolean;
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
  currentPage: { name: "battleHome", isInitial: true },
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
      return Object.assign({}, state, { stacks: [...state.stacks, item] });
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
  const { event, createEvent } = useEventSubscriber(["battleCreated", "openPage"], []);
  const { user } = useUserManager();

  const authCheck = (pageCfg: PageConfig) => {
    if (pageCfg.auth && !user) {
      return false;
    } else return true;
  };

  useEffect(() => {
    if (event) {
      switch (event.name) {
        case "battleCreated":
          dispatch({ type: actions.PAGE_PUSH, data: { name: "battlePlay", data: event.data } });
          break;
        case "openPage":
          openPage(event.data);
          break;
        default:
          break;
      }
    }
  }, [event]);

  const openPage = useCallback(
    (page: PageItem) => {
      let scfg: PageConfig | undefined = StackPages.find((p) => p.name === page.name);
      if (scfg) {
        if (!authCheck(scfg)) {
          dispatch({ type: actions.PAGE_PUSH, data: { name: "signin", data: page } });
        } else dispatch({ type: actions.PAGE_PUSH, data: page });
      } else {
        let ncfg = NavPages.find((p) => p.name === page.name);
        if (ncfg) {
          const curPage = NavPages.find((p) => p.name === state.currentPage.name);
          let contextChanged = false;
          if (curPage?.context !== ncfg.context) {
            contextChanged = true;
            createEvent({ name: "closeAllPop", data: null, delay: 4 });
          }

          if (!authCheck(ncfg)) dispatch({ type: actions.PAGE_PUSH, data: { name: "signin", data: page } });
          else dispatch({ type: actions.PAGE_CHANGE, data: { page, contextChanged } });
        }
      }
    },
    [user]
  );
  const value = {
    stacks: state.stacks,
    prevPage: state.prevPage,
    currentPage: state.currentPage,
    pushPage: useCallback((page: PageItem) => {
      dispatch({ type: actions.PAGE_PUSH, data: page });
    }, []),
    popPage: useCallback((pages: string[]) => {
      dispatch({ type: actions.PAGE_POP, data: pages });
    }, []),
    openPage,
  };

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export const usePageManager = () => {
  return useContext(PageContext);
};

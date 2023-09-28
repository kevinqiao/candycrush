import React, { createContext, useCallback, useContext } from "react";
import { StackPages } from "../model/PageCfg";
interface PageItem {
  name: string;
  data?: any;
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
  currentPage: { name: "battleHome" },
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
      const ps = state.stacks.filter((p: PageItem) => !action.data.includes(p.name));
      return Object.assign({}, state, { stacks: ps });
    case actions.PAGE_CHANGE:
      return Object.assign({}, state, { prevPage: state.currentPage, currentPage: action.data.page });
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
    openPage: (page: PageItem) => {
      const stack = StackPages.find((p) => p.name === page.name);
      if (stack) {
        dispatch({ type: actions.PAGE_PUSH, data: page });
      } else {
        dispatch({ type: actions.PAGE_CHANGE, data: { page } });
      }
    },
  };

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

export const usePageManager = () => {
  return useContext(PageContext);
};

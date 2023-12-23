import { useAction, useQuery } from "convex/react";
import React, { createContext, useCallback, useContext, useEffect } from "react";
import { api } from "../convex/_generated/api";
import { usePageManager } from "./PageManager";
interface UserEvent {
  id: string;
  name: string;
  data: any;
}
interface User {
  uid: string;
  token: string;
  name?: string;
  battle?: any;
}
interface IUserContext {
  user: any | null;
  userEvent: UserEvent | null;
  authComplete: (user: User) => void;
  signout: () => void;
  signup: () => void;
}

const initialState = {
  user: null,
};

const actions = {
  AUTH_COMPLETE: "AUTH_COMPLETE",
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
  SIGN_UP: "SIGN_UP",
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case actions.AUTH_COMPLETE:
      return Object.assign({}, state, { user: action.data });
    case actions.SIGN_IN:
      return Object.assign({}, state, action.data);
    case actions.SIGN_OUT:
      return Object.assign({}, state, { user: null });
    case actions.SIGN_UP:
      break;
    default:
      return state;
  }
};

const UserContext = createContext<IUserContext>({
  user: null,
  userEvent: null,
  authComplete: () => null,
  signout: () => null,
  signup: () => null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { openPage } = usePageManager();
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const authByToken = useAction(api.UserService.authByToken);
  const userEvent: any = useQuery(api.events.getByUser, { uid: state.user?.uid ?? "###" });

  useEffect(() => {
    const userJSON = localStorage.getItem("user");
    if (userJSON) {
      const user = JSON.parse(userJSON);
      authByToken({ uid: user.uid, token: "12345" }).then((u: any) => {
        if (u) {
          localStorage.setItem("user", JSON.stringify({ uid: user.uid, token: "12345" }));
          dispatch({ type: actions.AUTH_COMPLETE, data: u });
          if (u.battle) openPage({ name: "battlePlay", data: { act: "load", battle: u.battle } });
        }
      });
    }
  }, []);

  const value = {
    user: state.user,
    userEvent,
    authComplete: useCallback((user: User) => {
      localStorage.setItem("user", JSON.stringify({ uid: user.uid, token: "12345" }));
      dispatch({ type: actions.AUTH_COMPLETE, data: user });
    }, []),

    signout: useCallback(() => {
      localStorage.removeItem("user");
      dispatch({ type: actions.SIGN_OUT });
    }, []),
    signup: useCallback(() => {}, []),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserManager = () => {
  return useContext(UserContext);
};

import React, { createContext, useCallback, useContext, useEffect } from "react";
import useEventSubscriber from "./EventManager";
interface User {
  uid: string;
  name?: string;
  data?: any;
}
interface IUserContext {
  user: any | null;
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
      return Object.assign({}, state, { uid: null, name: null });
    case actions.SIGN_UP:
      break;
    default:
      return state;
  }
};

const UserContext = createContext<IUserContext>({
  user: null,
  authComplete: () => null,
  signout: () => null,
  signup: () => null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { createEvent } = useEventSubscriber([], []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
    }
  }, []);
  const value = {
    user: state.user,
    authComplete: useCallback((user: User) => {
      localStorage.setItem("token", "12345");
      dispatch({ type: actions.AUTH_COMPLETE, data: user });
      // createEvent({ name: "closePage", topic: "page", data: { name: "signin" }, delay: 10 });
    }, []),

    signout: useCallback(() => {
      dispatch({ type: actions.SIGN_OUT });
    }, []),
    signup: useCallback(() => {}, []),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserManager = () => {
  return useContext(UserContext);
};

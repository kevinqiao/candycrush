import React, { createContext, useCallback, useContext } from "react";
import useEventSubscriber from "./EventManager";
interface User {
  uid: string;
  name: string;
}
interface IUserContext {
  uid: string | null;
  name: string | null;
  signin: (uname: string, password: string) => void;
  signout: () => void;
  signup: () => void;
}

const initialState = {
  uid: null,
  name: null,
};

const actions = {
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
  SIGN_UP: "SIGN_UP",
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
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
  uid: null,
  name: null,
  signin: () => null,
  signout: () => null,
  signup: () => null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { createEvent } = useEventSubscriber([], []);

  const value = {
    uid: state.uid,
    name: state.name,
    signin: useCallback((uname: string, password: string) => {
      dispatch({ type: actions.SIGN_IN, data: { uid: uname } });
      createEvent({ name: "closePage", topic: "page", data: { name: "signin" }, delay: 10 });
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

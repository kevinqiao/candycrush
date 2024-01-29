import { useAction, useQuery } from "convex/react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getTerminalType } from "util/useAgent";
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
  sessionCheck: number;
  userEvent: UserEvent | null;
  authComplete: (user: User) => void;
  signout: () => void;
  signup: () => void;
  signin: (uid: string, token: string) => void;
  findAllUser: () => any;
}

// const actions = {
//   AUTH_COMPLETE: "AUTH_COMPLETE",
//   SIGN_IN: "SIGN_IN",
//   SIGN_OUT: "SIGN_OUT",
//   SIGN_UP: "SIGN_UP",
// };

const UserContext = createContext<IUserContext>({
  user: null,
  sessionCheck: 0,
  userEvent: null,
  authComplete: () => null,
  signout: () => null,
  signup: () => null,
  signin: () => null,
  findAllUser: () => null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { openPage } = usePageManager();
  const [user, setUser] = useState<any>(null);
  const [sessionCheck, setSessionCheck] = useState(0); //0-to check 1-checked
  const [lastTime, setLastTime] = useState<number>(0);
  // const [state, dispatch] = React.useReducer(reducer, initialState);
  const authByToken = useAction(api.UserService.authByToken);
  const userEvent: any = useQuery(api.events.getByUser, { uid: user?.uid ?? "###", lastTime });
  const signinByToken = useAction(api.UserService.signin);
  const findAllUser = useAction(api.UserService.findAllUser);

  useEffect(() => {
    if (userEvent) setLastTime(userEvent.time);
  }, [userEvent]);
  useEffect(() => {
    const userJSON = localStorage.getItem("user");
    if (userJSON !== null) {
      const user = JSON.parse(userJSON);
      if (user)
        authByToken({ uid: user.uid, token: "12345" }).then((u: any) => {
          if (u) {
            u.timelag = u.timestamp - Date.now();
            localStorage.setItem("user", JSON.stringify({ uid: user.uid, token: "12345" }));
            setUser(u);
            if (u.battle) {
              const ps = window.location.pathname.split("/");
              if (ps[1] !== "tg" || getTerminalType() > 0) {
                const uri = window.location.pathname;
                window.history.replaceState({}, "", uri);
                openPage({
                  name: "battlePlay",
                  ctx: "match3",
                  data: { act: "load", battle: u.battle },
                  params: { act: "load", battleId: u.battle.id },
                });
              }
            }
          }
          setSessionCheck(1);
        });
      else setSessionCheck(1);
    } else setSessionCheck(1);
  }, []);

  const value = {
    user,
    sessionCheck,
    userEvent,
    authComplete: useCallback((user: User) => {
      localStorage.setItem("user", JSON.stringify({ uid: user.uid, token: "12345" }));
      setUser(user);
    }, []),

    signout: useCallback(() => {
      localStorage.removeItem("user");
      setUser(null);
    }, []),
    signup: useCallback(() => {}, []),
    signin: useCallback(async (uid: string, token: string) => {
      const user = await signinByToken({ uid, token });
      if (user) {
        user.timelag = user.timestamp - Date.now();
        localStorage.setItem("user", JSON.stringify({ uid: user.uid, token: "12345" }));
        setUser(user);
        if (user.battle) {
          const uri = window.location.pathname;
          window.history.replaceState({}, "", uri);
          // openPage({
          //   name: "battlePlay",
          //   ctx: "match3",
          //   data: { act: "load", battle: user.battle },
          //   param: { act: "load", battleId: user.battle.id },
          // });
        }
      }
    }, []),
    findAllUser: useCallback(async () => {
      return await findAllUser();
    }, [findAllUser]),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserManager = () => {
  return useContext(UserContext);
};

import { useAction, useQuery } from "convex/react";
import { AppsConfiguration } from "model/PageConfiguration";
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
  const { currentPage, openPage } = usePageManager();
  const [user, setUser] = useState<any>(null);
  const [sessionCheck, setSessionCheck] = useState(0); //0-to check 1-checked
  const [lastTime, setLastTime] = useState<number>(0);
  // const [state, dispatch] = React.useReducer(reducer, initialState);
  const authByToken = useAction(api.UserService.authByToken);
  const userEvent: any = useQuery(api.events.getByUser, { uid: user?.uid ?? "###", lastTime });
  const signinByToken = useAction(api.UserService.signin);
  const findAllUser = useAction(api.UserService.findAllUser);
  const authComplete = useCallback((user: User) => {
    console.log(user);
    const ps = location.pathname.split("/");
    const app: any = AppsConfiguration.find((a) => a.context === ps[1]);
    if (app && !app.authLife) localStorage.setItem("user", JSON.stringify({ uid: user.uid, token: user.token }));
    setUser(user);
  }, []);
  useEffect(() => {
    if (userEvent) setLastTime(userEvent.time);
  }, [userEvent]);
  useEffect(() => {
    if (user || !currentPage) return;
    if (currentPage.params?.uid && currentPage.params?.token) {
      authByToken({ uid: currentPage.params.uid, token: currentPage.params.token }).then((u: any) => {
        if (u) {
          u.timelag = u.timestamp - Date.now();
          // setUser(u);
          authComplete(u);
        }
        setSessionCheck(1);
      });
    } else {
      const userJSON = localStorage.getItem("user");
      if (userJSON !== null) {
        const userObj = JSON.parse(userJSON);
        if (userObj["uid"] && userObj["token"])
          authByToken({ uid: userObj.uid, token: userObj.token }).then((u: any) => {
            if (u) {
              u.timelag = u.timestamp - Date.now();
              authComplete(u);
              // localStorage.setItem("user", JSON.stringify({ uid: userObj.uid, token: u.token }));
              // setUser(u);
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
    }
  }, [user, currentPage]);

  const value = {
    user,
    sessionCheck,
    userEvent,
    authComplete,
    signout: useCallback(() => {
      localStorage.removeItem("user");
      setUser(null);
    }, []),
    signup: useCallback(() => {}, []),
    signin: useCallback(async (uid: string, token: string) => {
      const user = await signinByToken({ uid, token });
      console.log(user);
      if (user) {
        user.timelag = user.timestamp - Date.now();
        authComplete(user);
        // localStorage.setItem("user", JSON.stringify({ uid: user.uid, token: "12345" }));
        // setUser(user);
        // if (user.battle) {
        //   const uri = window.location.pathname;
        //   window.history.replaceState({}, "", uri);
        // }
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

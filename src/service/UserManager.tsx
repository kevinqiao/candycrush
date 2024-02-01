import { useAction, useQuery } from "convex/react";
import { PageItem } from "model/PageProps";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { buildStackURL, getCurrentAppConfig } from "util/PageUtils";
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
  timelag: number;
  timestamp?: number;
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
  const { stacks, currentPage, openPage } = usePageManager();
  const [user, setUser] = useState<any>(null);
  const [sessionCheck, setSessionCheck] = useState(0); //0-to check 1-checked
  const [lastTime, setLastTime] = useState<number>(0);
  // const [state, dispatch] = React.useReducer(reducer, initialState);
  const authByToken = useAction(api.UserService.authByToken);
  const userEvent: any = useQuery(api.events.getByUser, { uid: user?.uid ?? "###", lastTime });
  const signinByToken = useAction(api.UserService.signin);
  const findAllUser = useAction(api.UserService.findAllUser);

  const openBattle = useCallback((u: User, battle: any) => {
    const app: any = getCurrentAppConfig();
    const pageItem: PageItem = {
      name: "battlePlay",
      ctx: app.context,
      data: { battle },
      params: { battleId: battle.id },
    };
    console.log(app.context)
    if (app.context === "tg" && window.Telegram?.WebApp) {
      pageItem.params.uid = u.uid;
      pageItem.params.token = u.token;
      const url = buildStackURL(pageItem);
      window.Telegram.WebApp.openLink(url);
      return;
    } else openPage(pageItem);
  }, []);
  const authComplete = useCallback(
    (u: User) => {
      u.timelag = u.timestamp ? u.timestamp - Date.now() : 0;
      const app: any = getCurrentAppConfig();
      if (u && app && !app.authLife)
        localStorage.setItem("user", JSON.stringify({ uid: u.uid, token: u.token, context: app.context }));
      if (u.battle) {
        const stack = stacks.find((s) => s.name === "battlePlay");
        if (!stack) openBattle(u, u.battle);
      }
      setUser(u);
    },
    [stacks]
  );
  useEffect(() => {
    if (userEvent && user) {
      if (userEvent?.name === "battleCreated") {
        openBattle(user, userEvent.data);
      }
      setLastTime(userEvent.time);
    }
  }, [user, userEvent]);
  useEffect(() => {
    if (user || !currentPage) return;
    const app: any = getCurrentAppConfig();
    let uid, token;
    if (currentPage.params?.uid && currentPage.params?.token) {
      uid = currentPage.params?.uid;
      token = currentPage.params?.token;
    } else {
      const userJSON = localStorage.getItem("user");
      if (userJSON !== null) {
        const userObj = JSON.parse(userJSON);
        console.log(userObj);
        if (userObj["uid"] && userObj["token"] && userObj["context"] === app.context) {
          uid = userObj["uid"];
          token = userObj["token"];
        }
      }
    }
    if (uid && token) {
      authByToken({ uid, token }).then((u: any) => {
        if (u) {
          u.timelag = u.timestamp - Date.now();
          console.log(u);
          authComplete(u);
        }
        setSessionCheck(1);
      });
    } else setSessionCheck(1);
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

import { useAction, useQuery } from "convex/react";
import { PageItem } from "model/PageProps";
import { User } from "model/User";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { embedAuth } from "util/AuthUtils";
import { buildStackURL, getCurrentAppConfig } from "util/PageUtils";
import { api } from "../convex/_generated/api";
import { usePageManager } from "./PageManager";
interface UserEvent {
  id: string;
  name: string;
  data: any;
}

interface IUserContext {
  user: any | null;
  sessionCheck: number;
  userEvent: UserEvent | null;
  authComplete: (user: User) => void;
  signout: () => void;
}

const UserContext = createContext<IUserContext>({
  user: null,
  sessionCheck: 0,
  userEvent: null,
  authComplete: () => null,
  signout: () => null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { stacks, currentPage, openPage } = usePageManager();
  const [user, setUser] = useState<any>(null);
  const [sessionCheck, setSessionCheck] = useState(0); //0-to check 1-checked
  const [lastTime, setLastTime] = useState<number>(0);
  const authByToken = useAction(api.UserService.authByToken);
  const userEvent: any = useQuery(api.events.getByUser, { uid: user?.uid ?? "###", lastTime });

  const openBattle = useCallback((u: User, battle: any) => {
    const app: any = getCurrentAppConfig();
    const pageItem: PageItem = {
      name: "battlePlay",
      ctx: app.context,
      data: { battle },
      params: { battleId: battle.id },
    };
    console.log(u);
    if (u?.authEmbed) {
      pageItem.params.uid = u.uid;
      pageItem.params.token = u.token;
      const url = buildStackURL(pageItem);
      window.Telegram.WebApp.openLink(url);
    } else openPage(pageItem);
  }, []);

  const authComplete = useCallback(
    (u: User) => {
      u.timelag = u.timestamp ? u.timestamp - Date.now() : 0;
      const app: any = getCurrentAppConfig();
      // if (u && app && !app.authLife)
      localStorage.setItem(
        "user",
        JSON.stringify({ uid: u.uid, token: u.token, context: app.context, authEmbed: u.authEmbed ?? 0 })
      );
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
      console.log(userEvent);
      if (userEvent?.name === "battleCreated") {
        openBattle(user, userEvent.data);
      }
      setLastTime(userEvent.time);
    }
  }, [user, userEvent]);

  useEffect(() => {
    if (!user && sessionCheck) {
      const app: any = getCurrentAppConfig();
      if (app)
        embedAuth(app).then((u) => {
          if (u) authComplete(u);
        });
    }
  }, [user, sessionCheck]);

  useEffect(() => {
    if (user || !currentPage) return;
    // const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // console.log(userAgent);

    let uid, token;
    let authEmbed = 0; //0-external browser
    if (currentPage.params?.uid && currentPage.params?.token) {
      uid = currentPage.params?.uid;
      token = currentPage.params?.token;
    } else {
      const userJSON = localStorage.getItem("user");
      if (userJSON !== null) {
        const userObj = JSON.parse(userJSON);
        if (userObj["uid"] && userObj["token"]) {
          uid = userObj["uid"];
          token = userObj["token"];
          authEmbed = userObj["authEmbed"] ?? 0;
        }
      }
    }
    if (uid && token) {
      authByToken({ uid, token })
        .then((u: any) => {
          console.log(u);
          if (u) {
            u.timelag = u.timestamp - Date.now();
            authComplete({ ...u, authEmbed });
          }
          // setSessionCheck(1);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => setSessionCheck(1));
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
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserManager = () => {
  return useContext(UserContext);
};

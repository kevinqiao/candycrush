import { useAction, useQuery } from "convex/react";
import { PageItem } from "model/PageProps";
import { User } from "model/User";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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
  const [lastTime, setLastTime] = useState<number>(Date.now());
  const authByToken = useAction(api.UserService.authByToken);
  const userEvent: any = useQuery(api.events.getByUser, { uid: user?.uid ?? "###", lastTime });

  const openBattle = useCallback((u: User, battle: any) => {
    const app: any = getCurrentAppConfig();
    const pageItem: PageItem = {
      name: "battlePlay",
      ctx: app.context,
      data: { battleId: battle.id },
      params: { battleId: battle.id },
    };

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
      console.log(u);
      localStorage.setItem("user", JSON.stringify({ uid: u.uid, token: u.token, authEmbed: u.authEmbed ?? 0 }));
      if (u.battle) {
        const stack = stacks.find((s) => s.name === "battlePlay");
        if (!stack) setTimeout(() => openBattle(u, u.battle), 500);
      }
      setLastTime(u.timelag + Date.now());
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
  console.log(user);
  // useEffect(() => {
  //   if (sessionCheck === 1) {
  //     const app: any = getCurrentAppConfig();
  //     if (app?.auth) {
  //       window.location.href = "/";
  //     }
  //   }
  // }, [sessionCheck]);

  useEffect(() => {
    if (user || !currentPage) return;

    let uid, token;
    let authEmbed = 0; //0-external browser 1-telegram bot 2-browser url
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
      let status = 1;
      authByToken({ uid, token })
        .then((u: any) => {
          if (u) {
            u.timelag = u.timestamp - Date.now();
            authComplete({ ...u, authEmbed });
            status = 2;
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setSessionCheck(status);
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
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
export const useUserManager = () => {
  const ctx = useContext(UserContext);

  return { ...ctx };
};
export default UserProvider;

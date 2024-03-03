import { useAuth, useClerk } from "@clerk/clerk-react";
import { useAuthorize } from "component/signin/useAuthorize";
import { useAction } from "convex/react";
import { User } from "model/User";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../convex/_generated/api";
import { usePageManager } from "./PageManager";

interface IUserContext {
  user: any | null;
  sessionCheck: number;
  authComplete: (user: User) => void;
  signout: () => void;
}

const UserContext = createContext<IUserContext>({
  user: null,
  sessionCheck: 0,
  authComplete: () => null,
  signout: () => null,
});

export const SSOProvider = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useClerk();
  const { stacks, currentPage } = usePageManager();
  const [user, setUser] = useState<any>(null);
  const [sessionCheck, setSessionCheck] = useState(0); //0-to check 1-checked
  const authByToken = useAction(api.UserService.authByToken);
  const { getToken, isSignedIn } = useAuth();
  const { authClerk, authTgbot } = useAuthorize();

  const authComplete = useCallback(
    (u: User) => {
      u.timelag = u.timestamp ? u.timestamp - Date.now() : 0;
      localStorage.setItem("user", JSON.stringify({ uid: u.uid, token: u.token, authEmbed: u.authEmbed ?? 0 }));
      setUser(u);
    },

    [stacks]
  );
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    for (const param of searchParams) {
      if (user?.uid && param[0] === "redirect") window.location.href = param[1];
      if (param[0] === "signout") {
        signOut().then(() => {
          if (user?.uid) {
            localStorage.removeItem("user");
            setUser(null);
          }
        });
      }
    }
  }, [user]);
  useEffect(() => {
    const channelAuth = async () => {
      let res;
      if (isSignedIn) {
        const t: string | null = await getToken();
        res = await authClerk(t);
      } else if (window.Telegram) {
        const telegramData = window.Telegram.WebApp.initData;
        res = await authTgbot(telegramData);
      }
      if (res?.status === "success") {
        authComplete(res.message);
      }
    };

    if (sessionCheck === 1) channelAuth();
  }, [isSignedIn, sessionCheck, window.Telegram]);

  useEffect(() => {
    if (user || !currentPage) return;
    const checkSession = async () => {
      let uid, token;
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
          }
        }
      }
      if (uid && token) {
        const u = await authByToken({ uid, token });
        console.log(u);
        if (u) {
          u.timelag = u.timestamp - Date.now();
          authComplete(u);
          setSessionCheck(2);
          return;
        }
      }
      setSessionCheck(1);
    };
    checkSession();
  }, [user, currentPage]);

  const value = {
    user,
    sessionCheck,
    authComplete,
    signout: useCallback(() => {
      localStorage.removeItem("user");
      setUser(null);
    }, []),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useSSOManager = () => {
  const ctx = useContext(UserContext);
  return { ...ctx };
};
export default SSOProvider;

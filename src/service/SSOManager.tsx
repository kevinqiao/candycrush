import { useAuth, useClerk } from "@clerk/clerk-react";
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
    const fetchDataFromExternalResource = async () => {
      const token = await getToken();
      if (!token) return;
      const url = "http://localhost/clerk";
      // const url = "https://telegram-bot-8bgi.onrender.com/clerk";
      const res = await fetch(url, {
        method: "GET", // 或 'POST', 'PUT', 'DELETE' 等
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 将 token 添加到请求头中
          mode: "cors",
        },
      });
      const json = await res.json();

      if (json.status === "success") {
        authComplete(json.message);
      }
    };
    if (isSignedIn && sessionCheck === 1) {
      fetchDataFromExternalResource();
    }
  }, [isSignedIn, sessionCheck]);

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

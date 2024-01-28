import React, { createContext, useEffect } from "react";
import { usePageManager } from "service/PageManager";
import { useUserManager } from "service/UserManager";

interface ITelegramAuthContext {
  // env: number; //0-in telegram mobile app 1-in telegram web app 2-unknown
}

const TelegramAuthContext = createContext<ITelegramAuthContext>({});
const BOT_URL = "https://telegram-bot-8bgi.onrender.com/tg/auth";
// const BOT_URL = "https://telegram-auth.onrender.com/telegram-auth";

export const TelegramAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { openPage } = usePageManager();

  const { sessionCheck } = useUserManager();

  useEffect(() => {
    window.Telegram.WebApp.expand();
    // console.log("session check:" + sessionCheck);
    if (sessionCheck) {
      const telegramData = window.Telegram.WebApp.initData;
      fetch(BOT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ authData: telegramData }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("网络响应错误");
          }
          return response.json();
        })
        .then((data) => {
          // 处理验证成功的情况
          console.log("验证成功:", data);
        })
        .catch((error) => {
          // 处理错误情况
          console.error("验证失败:", error);
        });
    }
  }, [sessionCheck]);

  const value = {};

  return <TelegramAuthContext.Provider value={value}>{children}</TelegramAuthContext.Provider>;
};

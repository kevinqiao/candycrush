import React, { createContext, useEffect } from "react";
import { usePageManager } from "service/PageManager";
import { useUserManager } from "service/UserManager";

interface ITelegramAuthContext {}

const TelegramAuthContext = createContext<ITelegramAuthContext>({});
const BOT_URL = "https://telegram-bot-8bgi.onrender.com/auth";
const getTelegramData = () => {
  // 确保 Telegram 的 Web App API 已经加载
  if (window.Telegram?.WebApp) {
    // 获取用户数据
    const userData = window.Telegram?.WebApp.initDataUnsafe;
    console.log(userData);
    return userData;
    // 返回需要的数据
    // return {
    //   userId: userData.user.id, // 用户ID
    //   authDate: userData.auth_date, // 授权日期
    //   hash: userData.hash, // 安全哈希
    //   // 还可以获取更多数据，根据需要添加
    // };
  } else {
    console.error("Telegram WebApp API 未加载");
    return null;
  }
};

export const TelegramAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { openPage } = usePageManager();
  const { sessionCheck } = useUserManager();
  useEffect(() => {
    console.log("session check:" + sessionCheck);
    if (sessionCheck) {
      const telegramData = getTelegramData();
      // fetch(BOT_URL)
      //   .then((response) => {
      //     // 检查响应状态
      //     if (!response.ok) {
      //       throw new Error(`HTTP error! status: ${response.status}`);
      //     }
      //     // 解析响应内容为 JSON
      //     return response.json();
      //   })
      //   .then((data) => {
      //     // 处理获取到的数据
      //     console.log(data);
      //   })
      //   .catch((error) => {
      //     // 处理错误
      //     console.error("请求失败:", error);
      //   });

      fetch(BOT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(telegramData),
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

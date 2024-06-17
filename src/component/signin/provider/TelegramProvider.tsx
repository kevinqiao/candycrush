import React, { useEffect } from "react";
import { useUserManager } from "service/UserManager";
import { useAuthorize } from "../useAuthorize";
const TelegramProvider = () => {
  const { authTgbot } = useAuthorize();
  const { authComplete } = useUserManager();
  useEffect(() => {
    const authorizeToken = async () => {
      if (!window.Telegram || !window.Telegram.WebApp) return;
      const telegramData = window.Telegram.WebApp.initData;
      const res = await authTgbot(telegramData);
      if (res?.status === "success") {
        authComplete(res.message);
      }
    };
    authorizeToken();
  }, []);
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100vh",
          backgroundColor: "black",
        }}
      >
        <div style={{ fontSize: "20px", color: "blue" }}>Authenticating...</div>
      </div>
    </>
  );
};

export default TelegramProvider;

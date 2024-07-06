import { useConvex } from "convex/react";
import React, { useEffect } from "react";
import usePartnerManager from "service/PartnerManager";
import { useUserManager } from "service/UserManager";
import { api } from "../../../convex/_generated/api";
import { AuthProps } from "../SSOController";
const TelegramProvider: React.FC<AuthProps> = ({ channel, provider }) => {
  // const { authTgbot } = useAuthorize();
  const { authComplete } = useUserManager();
  const { partner } = usePartnerManager();
  const convex = useConvex();
  useEffect(() => {
    if (!partner) return;
    const src = "https://telegram.org/js/telegram-web-app.js";
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = async () => {
      // console.log(`${src} has been loaded.`);
      if (!window.Telegram || !window.Telegram.WebApp) return;
      const telegramData = window.Telegram.WebApp.initData;
      console.log(telegramData);
      // const res = await authTgbot(telegramData);
      // console.log(res);
      const res = await convex.action(api.authoize.authorize, {
        data: { authData: telegramData },
        channelId: channel,
        partner: partner.pid,
      });
      if (res.ok) {
        authComplete(res.message);
      }
    };
    script.onerror = () => {
      console.error(`Error loading ${src}`);
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [partner]);

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

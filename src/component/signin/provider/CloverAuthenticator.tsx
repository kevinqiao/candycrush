import { useConvex } from "convex/react";
import React, { useCallback, useEffect, useState } from "react";
import usePartnerManager from "service/PartnerManager";
import { useUserManager } from "service/UserManager";
import { getURIParam } from "util/PageUtils";
import { api } from "../../../convex/_generated/api";
import { AuthProps } from "../SSOController";
const CloverAuthenticator: React.FC<AuthProps> = ({ authenticator }) => {
  const { partner } = usePartnerManager();
  const { user, authComplete } = useUserManager();
  const [error, setError] = useState(0);
  const convex = useConvex();
  useEffect(() => {
    const channelAuth = async (code: string) => {
      if (!partner) return;
      const res = await convex.action(api.authoize.authorize, {
        data: { code },
        channelId: authenticator.channel,
        partnerId: partner?.pid,
      });
      console.log(res);
      if (res?.ok) {
        authComplete(res.message);
      } else setError(res.errorCode);
    };
    const code = getURIParam("code");
    if (code) channelAuth(code);
    else setError(1);
  }, [partner]);
  const login = useCallback(() => {
    const url = "http://localhost:3000/www/oauth-code.html";
    window.location.href = url;
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        backgroundColor: "white",
      }}
    >
      {!user || error > 0 ? (
        <div
          style={{
            cursor: "pointer",
            width: "100px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgb(221, 217, 225)",
            color: "rgb(83, 77, 237)",
          }}
          onClick={login}
        >
          SignIn By Clover Oauth!
        </div>
      ) : null}
    </div>
  );
};

export default CloverAuthenticator;

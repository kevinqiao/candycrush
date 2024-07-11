import { useConvex } from "convex/react";
import React, { useEffect, useState } from "react";
import useEventSubscriber from "service/EventManager";
import usePartnerManager from "service/PartnerManager";
import { useUserManager } from "service/UserManager";
import { getURIParam } from "util/PageUtils";
import { api } from "../../../convex/_generated/api";
import { AuthProps } from "../SSOController";
const CloverEmbedAuthenticator: React.FC<AuthProps> = ({ authenticator, close }) => {
  const { partner } = usePartnerManager();
  const { user, authComplete } = useUserManager();
  const [error, setError] = useState(0);
  const convex = useConvex();
  const { event: accountEvent } = useEventSubscriber([], ["account"]);
  useEffect(() => {
    const channelAuth = async (accessToken: string) => {
      if (!partner) return;
      const res = await convex.action(api.authoize.authorize, {
        data: { accessToken },
        channelId: authenticator.channel,
        partnerId: partner?.pid,
      });
      if (res?.ok) {
        console.log(res.message);
        authComplete(res.message);
      } else setError(res.errorCode);
    };
    const token = getURIParam("accessToken");
    if (token) channelAuth(token);
    else setError(1);
  }, [partner]);
  useEffect(() => {
    if (accountEvent?.name === "signin") {
      const url = "http://localhost:3000/www/oauth-token.html";
      window.location.href = url;
    }
  }, [accountEvent]);

  return (
    <>
      {/* {!user ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
          }}
        >
          <span>You need to login!</span> */}
      {/* <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "50%",
          height: "50%",
          backgroundColor: "white",
        }}
      >
        <div style={{ fontSize: "20px", color: "blue" }}>Clover Embed Login!</div>
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
            Login({error})
          </div>
        ) : (
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
            onClick={close}
          >
            close
          </div>
        )}
      </div> */}
      {/* </div>
      ) : null} */}
    </>
  );
};

export default CloverEmbedAuthenticator;

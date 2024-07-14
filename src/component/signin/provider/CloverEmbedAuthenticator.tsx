import { useConvex } from "convex/react";
import { gsap } from "gsap";
import React, { useCallback, useEffect, useRef, useState } from "react";
import usePartnerManager from "service/PartnerManager";
import { useUserManager } from "service/UserManager";
import { getURIParam } from "util/PageUtils";
import { api } from "../../../convex/_generated/api";
import { AuthProps } from "../SSOController";
const CloverEmbedAuthenticator: React.FC<AuthProps> = ({ authenticator }) => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<HTMLDivElement | null>(null);
  const { partner } = usePartnerManager();
  const { user, authComplete } = useUserManager();
  const [error, setError] = useState(0);
  const convex = useConvex();
  useEffect(() => {
    const channelAuth = async (accessToken: string) => {
      if (!partner) return;
      const res = await convex.action(api.authoize.authorize, {
        data: { accessToken },
        channelId: authenticator.channel,
        partnerId: partner?.pid,
      });
      console.log(res);
      if (res?.ok) {
        authComplete(res.message, 0);
        close();
      } else setError(res.errorCode);
    };
    const token = getURIParam("accessToken");
    if (token) {
      show();
      setTimeout(() => channelAuth(token), 3000);
    } else setError(1);
  }, [partner]);

  useEffect(() => {
    if (user) close();
  }, [user]);

  const show = useCallback(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.fromTo(maskRef.current, { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.8 });
    tl.fromTo(controllerRef.current, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1.0, duration: 0.8 }, "<");
    tl.play();
  }, []);

  const close = useCallback(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 0, duration: 0.6 });
    tl.to(controllerRef.current, { autoAlpha: 0, duration: 0.6 }, "<");
    tl.play();
  }, []);

  return (
    <>
      <div
        ref={maskRef}
        className="mask"
        style={{ zIndex: 1990, width: "100vw", height: "100vh", backgroundColor: "red" }}
      ></div>
      <div
        ref={controllerRef}
        className="signin_control"
        style={{
          zIndex: 2000,
          color: "white",
        }}
      >
        {error > 0 ? "Authentication fail" : "Loading...."}
      </div>
    </>
  );
};

export default CloverEmbedAuthenticator;

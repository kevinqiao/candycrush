import { ClerkProvider, SignIn, useAuth, useClerk } from "@clerk/clerk-react";
import { AuthCloseBtn } from "component/common/StyledComponents";
import { useConvex } from "convex/react";
import { gsap } from "gsap";
import { AppsConfiguration } from "model/PageConfiguration";
import { PageConfig } from "model/PageProps";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import useEventSubscriber from "service/EventManager";
import { usePageManager } from "service/PageManager";
import usePartnerManager from "service/PartnerManager";
import { useUserManager } from "service/UserManager";
import { buildNavURL, getCurrentAppConfig } from "util/PageUtils";
import { api } from "../../../convex/_generated/api";
import { AuthProps } from "../SSOController";
import "../signin.css";

const AuthorizeToken: React.FC<AuthProps> = ({ authenticator }) => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLDivElement | null>(null);
  const { signOut } = useClerk();
  const { getToken, isSignedIn } = useAuth();
  const { user, authComplete } = useUserManager();
  const { app, partner } = usePartnerManager();
  const { currentPageStatus, currentPage, openPage, prevPage } = usePageManager();
  const { event: accountEvent } = useEventSubscriber([], ["account"]);
  const convex = useConvex();

  const redirectURL = useMemo(() => {
    if (app && currentPage) {
      if (app.partnerId > 0) {
        currentPage.params
          ? (currentPage.params["partner"] = app.partnerId)
          : (currentPage.params = { partner: app.partnerId });
      }
      const url = buildNavURL(currentPage);

      return url;
    }
  }, [app, user, currentPage]);
  useEffect(() => {
    if (user && isSignedIn) {
      signOut();
    }
  }, [user, isSignedIn, signOut]);
  useEffect(() => {
    if (!currentPage) return;
    const app: any = AppsConfiguration.find((c) => c.name === currentPage.app);
    if (app?.navs) {
      const config: PageConfig | undefined = app.navs.find((s) => s.name === currentPage.name);
      const role = user ? user.role ?? 1 : 0;
      if (config?.auth && role < config.auth) {
        open();
      } else close();
    }
  }, [user, currentPage]);
  useEffect(() => {
    if (accountEvent && accountEvent?.name === "signin") {
      open();
    }
  }, [accountEvent]);
  const open = useCallback(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.fromTo(maskRef.current, { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.8 });
    tl.fromTo(closeBtnRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, "<");
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
    tl.to(closeBtnRef.current, { autoAlpha: 0, duration: 0.6 }, "<");
    tl.to(controllerRef.current, { autoAlpha: 0, scale: 0.6, duration: 0.6 }, "<");
    tl.play();
  }, []);
  const cancel = useCallback(() => {
    if (currentPageStatus < 1) {
      if (prevPage) openPage(prevPage);
      else {
        const appConfig = getCurrentAppConfig();
        if (appConfig.entry) openPage({ name: appConfig.entry, app: appConfig.name });
      }
    }
    close();
  }, []);
  useEffect(() => {
    const channelAuth = async () => {
      const t: string | null = await getToken();
      if (t && partner) {
        // const res = await convex.action(api.authoize.authorizeClerk, { jwttoken: t, partner: partner.pid });
        const res = await convex.action(api.authoize.authorize, {
          data: { jwttoken: t },
          channelId: authenticator.channel,
          partnerId: partner.pid,
        });
        if (res?.ok) {
          authComplete(res.message, 1);
        }
      }
    };
    if (partner && isSignedIn) {
      channelAuth();
    }
  }, [isSignedIn, partner, signOut]);
  return (
    <>
      <div ref={maskRef} className="mask" style={{ zIndex: 1990, width: "100vw", height: "100vh" }}></div>
      <AuthCloseBtn ref={closeBtnRef} style={{ zIndex: 2001 }} onClick={cancel} />
      <div
        ref={controllerRef}
        className="signin_control"
        style={{
          zIndex: 2000,
          opacity: 0,
        }}
      >
        {!isSignedIn && redirectURL ? <SignIn redirectUrl={redirectURL} afterSignInUrl={redirectURL} /> : null}
      </div>
    </>
  );
};
const ClerkAuthenticator: React.FC<AuthProps> = ({ authenticator }) => {
  return (
    <ClerkProvider publishableKey="pk_test_bGVuaWVudC1sb3VzZS04Ni5jbGVyay5hY2NvdW50cy5kZXYk">
      <AuthorizeToken authenticator={authenticator} />
    </ClerkProvider>
  );
};

export default ClerkAuthenticator;

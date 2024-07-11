import { Loading } from "component/common/StyledComponents";
import { useAction } from "convex/react";
import { gsap } from "gsap";
import { AppsConfiguration } from "model/PageConfiguration";
import { PageConfig } from "model/PageProps";
import React, { FunctionComponent, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEventSubscriber from "service/EventManager";
import { usePageManager } from "service/PageManager";
import usePartnerManager from "service/PartnerManager";
import { useUserManager } from "service/UserManager";
import styled from "styled-components";
import { getCurrentAppConfig, getURIParam } from "util/PageUtils";
import { api } from "../../convex/_generated/api";
import "./signin.css";
const CloseBtn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 2001;
  top: 0px;
  right: 0px;
  width: 60px;
  height: 50px;
  background-color: white;
  color: blue;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;
export interface AuthProps {
  authenticator: { id: string; channel: number; name: string; path: string; embed?: number; data: any };
  close?: () => void;
}
// gsap.registerPlugin(MotionPathPlugin);
const SSOController: React.FC = () => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const { partner } = usePartnerManager();
  const { user, authComplete } = useUserManager();
  const { currentPageStatus, currentPage, openPage, prevPage } = usePageManager();
  const { event: accountEvent } = useEventSubscriber([], ["account"]);
  const authByToken = useAction(api.UserService.authByToken);
  const [sessionCheckCompleted, setSessionCheckCompleted] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      let uid = getURIParam("uid");
      let token = getURIParam("token");
      if (!uid || !token) {
        const userJSON = localStorage.getItem("user");
        if (userJSON !== null) {
          const userObj = JSON.parse(userJSON);
          uid = userObj["uid"];
          token = userObj["token"];
        }
      }
      let u;
      let r = 1;
      if (uid && token) {
        u = await authByToken({ uid, token });
        if (u) {
          r = authComplete(u);
        }
      }
      setSessionCheckCompleted(r);
      gsap.to(loadingRef.current, { autoAlpha: 0, duration: 0.7 });
    };
    if (partner) {
      if (!partner.auth["embed"]) checkSession();
      else setSessionCheckCompleted(2);
    }
  }, [partner]);

  useEffect(() => {
    if (!partner || !currentPage) return;
    if (sessionCheckCompleted === 0) {
      close();
      return;
    }
   
    const app: any = AppsConfiguration.find((c) => c.name === currentPage.app);
    if (app?.navs) {
      const config: PageConfig | undefined = app.navs.find((s) => s.name === currentPage.name);
      const role = user ? user.role ?? 1 : 0;
      gsap.to(loadingRef.current, { autoAlpha: 0, duration: 0.3 });
      if (config?.auth && role < config.auth) {
        open();
      }
    }
  }, [partner, user, currentPage, sessionCheckCompleted]);
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
    tl.to(maskRef.current, { autoAlpha: 0, duration: 0.8 });
    tl.to(closeBtnRef.current, { autoAlpha: 0, duration: 0.8 }, "<");
    tl.to(controllerRef.current, { autoAlpha: 0, duration: 0.8 }, "<");
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
    if (accountEvent?.name === "signin") {
      open();
    } else if (accountEvent?.name === "logout") {
      close();
    }
  }, [accountEvent]);

  const render = useMemo(() => {
    if (sessionCheckCompleted > 0 && partner?.auth?.path) {
      const SelectedComponent: FunctionComponent<AuthProps> = lazy(() => import(`${partner.auth.path}`));
      return (
        <Suspense
          fallback={
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                color: "white",
                backgroundColor: "blue",
              }}
            >
              Loading
            </div>
          }
        >
          <SelectedComponent authenticator={partner.auth} />
        </Suspense>
      );
    }
  }, [partner, sessionCheckCompleted]);
  return (
    <>
      <div ref={maskRef} className="mask" style={{ zIndex: 1990, width: "100vw", height: "100vh" }}></div>
      <CloseBtn ref={closeBtnRef} onClick={cancel} />
      <div
        ref={controllerRef}
        style={{
          position: "absolute",
          zIndex: 2000,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "transparent",
        }}
      >
        {render}
      </div>
      <div
        ref={loadingRef}
        style={{ position: "absolute", zIndex: 2100, top: 0, left: 0, width: "100vw", height: "100vh" }}
      >
        <Loading>
          <span>Session Checking....</span>
        </Loading>
      </div>
    </>
  );
};

export default SSOController;

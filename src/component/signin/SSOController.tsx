import { Loading } from "component/common/StyledComponents";
import { useAction } from "convex/react";
import { gsap } from "gsap";
import React, { FunctionComponent, lazy, Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import useEventSubscriber from "service/EventManager";
import { usePageManager } from "service/PageManager";
import usePartnerManager from "service/PartnerManager";
import { useUserManager } from "service/UserManager";
import styled from "styled-components";
import { getPageConfig, getURIParam } from "util/PageUtils";
import { api } from "../../convex/_generated/api";
import "./signin.css";
const CloseBtn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
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
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const { partner } = usePartnerManager();
  const { user, authComplete } = useUserManager();
  const { currentPage } = usePageManager();
  const { event: accountEvent } = useEventSubscriber([], ["account"]);
  const authByToken = useAction(api.UserService.authByToken);

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
      if (uid && token) {
        u = await authByToken({ uid, token });
        if (u && u.partner === partner?.pid) {
          console.log(u);
          authComplete(u);
        }
      }
      gsap.to(loadingRef.current, { autoAlpha: 0, duration: 0.7 });
    };
    console.log(partner);
    if (partner && !partner.auth["embed"]) {
      console.log(partner);
      checkSession();
    }
  }, [partner]);

  useEffect(() => {
    if (!currentPage) return;
    const pageConfig: any = getPageConfig(currentPage.app, currentPage.name);
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    const role = user ? user.role ?? 1 : 0;
    if (pageConfig.auth > role) {
      tl.fromTo(maskRef.current, { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.8 });
      tl.fromTo(controllerRef.current, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1.0, duration: 0.8 }, "<");
    } else {
      tl.to(maskRef.current, { autoAlpha: 0, duration: 0.1 });
      tl.to(controllerRef.current, { autoAlpha: 0, duration: 0.1 }, "<");
    }
    tl.play();
  }, [user, currentPage]);
  const close = useCallback(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 0, duration: 0.1 });
    tl.to(controllerRef.current, { autoAlpha: 0, duration: 0.1 }, "<");
    tl.play();
  }, []);
  // useEffect(() => {
  //   if (accountEvent?.name === "signin") {
  //     gsap.to(controllerRef.current, { autoAlpha: 1, duration: 0.9 });
  //   } else if (accountEvent?.name === "logout") {
  //     gsap.to(controllerRef.current, { autoAlpha: 1, duration: 0.9 });
  //   }
  // }, [accountEvent]);

  const render = useMemo(() => {
    if (partner?.auth?.path) {
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
          <SelectedComponent authenticator={partner.auth} close={close} />
        </Suspense>
      );
    }
  }, [partner]);
  return (
    <>
      <div ref={maskRef} className="mask" style={{ zIndex: 1990, width: "100vw", height: "100vh" }}></div>
      <CloseBtn />
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
          <span>Loading Authenticator....</span>
        </Loading>
      </div>
    </>
  );
};

export default SSOController;

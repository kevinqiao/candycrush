import { Loading } from "component/common/StyledComponents";
import { useAction } from "convex/react";
import { gsap } from "gsap";
import React, { FunctionComponent, lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import usePartnerManager from "service/PartnerManager";
import { useUserManager } from "service/UserManager";
import { getURIParam } from "util/PageUtils";
import { api } from "../../convex/_generated/api";
import "./signin.css";
export interface AuthProps {
  authenticator: { id: string; channel: number; name: string; path: string; embed?: number; data: any };
  close?: () => void;
}
// gsap.registerPlugin(MotionPathPlugin);
const SSOController: React.FC = () => {
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const { app, partner } = usePartnerManager();
  const { authComplete } = useUserManager();
  const authByToken = useAction(api.UserService.authByToken);
  const [sessionCheckCompleted, setSessionCheckCompleted] = useState(0);
  useEffect(() => {
    if (sessionCheckCompleted === 0) gsap.to(loadingRef.current, { autoAlpha: 0, duration: 0 });
  }, [sessionCheckCompleted]);
  useEffect(() => {
    const checkURL = async () => {
      const uid = getURIParam("u");
      const token = getURIParam("t");
      if (uid && token) {
        const u = await authByToken({ uid, token });
        if (u) {
          authComplete(u, 0);
          gsap.to(loadingRef.current, { autoAlpha: 0, duration: 0.7 });
        }
      }
    };
    const checkStorage = async () => {
      const userJSON = localStorage.getItem("user");
      if (userJSON !== null) {
        const userObj = JSON.parse(userJSON);
        if (userObj["uid"] && userObj["token"]) {
          const u = await authByToken({ uid: userObj["uid"], token: userObj["token"] });
          if (u) authComplete(u, 1);
        }
      }
      setSessionCheckCompleted(1);
      gsap.to(loadingRef.current, { autoAlpha: 0, duration: 0.7 });
    };

    if (partner && app) {
      if (app.channel === -1) checkURL();
      else if (!partner.auth?.embed) checkStorage();
      else {
        setSessionCheckCompleted(1);
        gsap.to(loadingRef.current, { autoAlpha: 0, duration: 0.7 });
      }
    }
  }, [app, partner]);

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
      {render}
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

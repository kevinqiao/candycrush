import { Loading } from "component/common/StyledComponents";
import { useAction } from "convex/react";
import { gsap } from "gsap";
import React, { FunctionComponent, lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import useEventSubscriber from "service/EventManager";
import { usePageManager } from "service/PageManager";
import usePartnerManager from "service/PartnerManager";
import { useUserManager } from "service/UserManager";
import { getPageConfig, getURIParam } from "util/PageUtils";
import { api } from "../../convex/_generated/api";
import "./signin.css";
export interface AuthProps {
  authenticator: { id: string; channel: number; name: string; path: string; data: any };
}
// gsap.registerPlugin(MotionPathPlugin);
const SSOController: React.FC = () => {
  const controllerRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [sessionCheckCompleted, setSessionCheckCompleted] = useState(0);
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
      console.log(uid + ":" + token);
      let u;
      if (uid && token) {
        u = await authByToken({ uid, token });
        if (u && u.partner === partner?.pid) {
          console.log(u);
          authComplete(u);
        }
      }
      gsap.to(loadingRef.current, { autoAlpha: 0, duration: 0.7 });
      // setSessionCheckCompleted(2);
      // gsap.to(controllerRef.current, { autoAlpha: u ? 0 : 1, duration: 0.7 });
      // setSessionCheckCompleted(u ? 1 : 2);
    };
    if (!partner) return;
    checkSession();
  }, [partner]);
  useEffect(() => {
    console.log(currentPage);
    if (!currentPage) return;
    const pageConfig: any = getPageConfig(currentPage.app, currentPage.name);
    console.log(pageConfig);
    if (pageConfig.auth && !user) {
      gsap.to(controllerRef.current, { autoAlpha: 1, duration: 0.4 });
    } else {
      gsap.to(controllerRef.current, { autoAlpha: 0, duration: 0.4 });
    }
  }, [user, currentPage]);

  // useEffect(() => {
  //   if (sessionCheckCompleted > 0 && user) {
  //     gsap.to(controllerRef.current, { autoAlpha: 0, duration: 0.1 });
  //     console.log("shut down authenticator");
  //   }
  // }, [user, sessionCheckCompleted]);
  useEffect(() => {
    if (accountEvent?.name === "signin") {
      gsap.to(controllerRef.current, { autoAlpha: 1, duration: 0.9 });
    } else if (accountEvent?.name === "logout") {
      console.log("logout happened");
      gsap.to(controllerRef.current, { autoAlpha: 1, duration: 0.9 });
      console.log(partner);
    }
  }, [accountEvent]);

  const render = useMemo(() => {
    console.log("rendering...." + sessionCheckCompleted);

    if (partner?.auth?.path) {
      console.log(partner.auth.path);
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
  }, [partner]);
  return (
    <>
      <div
        ref={controllerRef}
        style={{ position: "absolute", zIndex: 2000, top: 0, left: 0, width: "100vw", height: "100vh" }}
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

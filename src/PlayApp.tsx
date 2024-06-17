import Alert from "component/common/Alert";
import LocaleStyleLoader from "component/common/LocaleStyleLoader";
import NavHeader from "component/lobby/NavHeader";
import NavPage from "component/NavPage";
import SSOController from "component/signin/SSOController";
import StackController from "component/StackController";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { gsap } from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import React, { useEffect, useRef } from "react";
import useEventSubscriber, { EventProvider } from "service/EventManager";
import { LocalizationProvider } from "service/LocalizationManager";
import { PartnerProvider } from "service/PartnerManager";
import { TerminalProvider } from "service/TerminalManager";
import { PageProvider } from "./service/PageManager";
import { UserProvider, useUserManager } from "./service/UserManager";
// Register the plugin once globally
gsap.registerPlugin(MotionPathPlugin);
// gsap.registerPlugin(TransformPlugin);

const convex = new ConvexReactClient("https://dazzling-setter-839.convex.cloud");

const AuthCheck = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserManager();
  const { event: accountEvent } = useEventSubscriber([], ["account"]);
  useEffect(() => {
    if (accountEvent?.name === "logout") {
      const tl = gsap.timeline({
        onComplete: () => {
          tl.kill();
        },
      });
      tl.to(containerRef.current, { autoAlpha: 0, duration: 0.9 });
      tl.to(controllerRef.current, { autoAlpha: 1, duration: 0.9 }, "<");
      tl.play();
    }
  }, [accountEvent]);
  useEffect(() => {
    if (user) {
      const tl = gsap.timeline({
        onComplete: () => {
          tl.kill();
        },
      });
      tl.to(containerRef.current, { autoAlpha: 1, duration: 0.9 });
      tl.to(controllerRef.current, { autoAlpha: 0, duration: 0.7 }, "<");
      tl.play();
    }
  }, [user]);
  return (
    <>
      <div ref={containerRef} style={{ width: "100vw", height: "100vh", backgroundColor: "white" }}>
        {user && user.uid ? (
          <>
            <NavHeader />
            <NavPage />
            <StackController />
          </>
        ) : null}
      </div>
      <div ref={controllerRef} style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh" }}>
        <SSOController />
      </div>
    </>
  );
};

function M3App() {
  const FlattenedProviderTree = (providers: any): any => {
    if (providers?.length === 1) {
      return providers[0][0];
    }
    const [A, paramsA] = providers.shift();
    const [B, paramsB] = providers.shift();

    return FlattenedProviderTree([
      [
        ({ children }: { children: any }) => (
          <A {...(paramsA || {})}>
            <B {...(paramsB || {})}>{children}</B>
          </A>
        ),
      ],
      ...providers,
    ]);
  };
  const Providers = FlattenedProviderTree([
    [ConvexProvider, { client: convex }],
    [EventProvider],
    [PartnerProvider],
    [LocalizationProvider],
    [TerminalProvider],
    [PageProvider],
    [UserProvider],
  ]);
  return (
    <>
      <Providers>
        <LocaleStyleLoader />
        <AuthCheck />
        <Alert />
      </Providers>
    </>
  );
}

export default M3App;

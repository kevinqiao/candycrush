import Alert from "component/common/Alert";
import LocaleStyleLoader from "component/common/LocaleStyleLoader";
import NavHeader from "component/lobby/NavHeader";
import NavPage from "component/NavPage";
import StackController from "component/StackController";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { gsap } from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import React from "react";
import { EventProvider } from "service/EventManager";
import { LocalizationProvider } from "service/LocalizationManager";
import { TerminalProvider } from "service/TerminalManager";
import { PageProvider } from "./service/PageManager";
import { UserProvider, useUserManager } from "./service/UserManager";
// Register the plugin once globally
gsap.registerPlugin(MotionPathPlugin);
// gsap.registerPlugin(TransformPlugin);

const convex = new ConvexReactClient("https://dazzling-setter-839.convex.cloud");

const AuthCheck = () => {
  const { user } = useUserManager();
  return (
    <>
      {user && user.uid ? (
        <>
          <NavHeader />
          <NavPage />
          <StackController />
        </>
      ) : null}
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
    [EventProvider],
    [ConvexProvider, { client: convex }],
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

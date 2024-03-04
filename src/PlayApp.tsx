import NavPage from "component/NavPage";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { gsap } from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import React from "react";

import { ClerkProvider } from "@clerk/clerk-react";
import StackController from "component/StackController";
import NavHeader from "component/lobby/NavHeader";
import { CoordProvider } from "./service/CoordManager";
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
    [CoordProvider],
    [PageProvider],
    [ConvexProvider, { client: convex }],
    [UserProvider],
    // [Match3AuthProvider],
    [ClerkProvider, { publishableKey: "pk_test_bm9ybWFsLXNoZXBoZXJkLTQ5LmNsZXJrLmFjY291bnRzLmRldiQ" }],
    // [EventProvider],
  ]);
  return (
    <Providers>
      {/* <NavHeader />
      <NavPage />
      <StackController /> */}
      <AuthCheck />
    </Providers>
  );
}

export default M3App;
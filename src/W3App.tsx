import NavPage from "component/NavPage";
import StackController from "component/StackController";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { gsap } from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import React from "react";

import { ClerkProvider } from "@clerk/clerk-react";
import SSOProvider from "service/SSOManager";
import { CoordProvider } from "./service/CoordManager";
import { PageProvider } from "./service/PageManager";
// Register the plugin once globally
gsap.registerPlugin(MotionPathPlugin);
// gsap.registerPlugin(TransformPlugin);

const convex = new ConvexReactClient("https://dazzling-setter-839.convex.cloud");

function W3App() {
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
    [ClerkProvider, { publishableKey: "pk_test_bGVuaWVudC1sb3VzZS04Ni5jbGVyay5hY2NvdW50cy5kZXYk" }],
    [SSOProvider],
    // [EventProvider],
  ]);
  return (
    <Providers>
      <NavPage />
      <StackController />
    </Providers>
  );
}

export default W3App;

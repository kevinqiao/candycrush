import NavPage from "component/NavPage";
import StackController from "component/StackController";
import MainMenu from "component/menu/MainMenu";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { gsap } from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import { TelegramAuthProvider } from "./component/auth/provider/TelegramAuth";
import { CoordProvider } from "./service/CoordManager";
import { PageProvider } from "./service/PageManager";
import { UserProvider } from "./service/UserManager";
// Register the plugin once globally
gsap.registerPlugin(MotionPathPlugin);
// gsap.registerPlugin(TransformPlugin);

const convex = new ConvexReactClient("https://dazzling-setter-839.convex.cloud");
function TgApp() {
  window.Telegram.WebApp.expand();
  setTimeout(() => window.Telegram.WebApp.expand(), 2500);
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
    [TelegramAuthProvider],
    // [EventProvider],
  ]);
  return (
    <Providers>
      <MainMenu />
      <NavPage />
      <StackController />
    </Providers>
  );
}

export default TgApp;

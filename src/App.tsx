import { ConvexProvider, ConvexReactClient } from "convex/react";
import { gsap } from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import NavController from "./component/NavController";
import StackController from "./component/StackController";
import MainMenu from "./component/menu/MainMenu";
import { CoordProvider } from "./service/CoordManager";
import { EventProvider } from "./service/EventManager";
import { PageProvider } from "./service/PageManager";
import { UserProvider } from "./service/UserManager";
// Register the plugin once globally
gsap.registerPlugin(MotionPathPlugin);
// gsap.registerPlugin(TransformPlugin);

const convex = new ConvexReactClient("https://kindred-grasshopper-414.convex.cloud");
function App() {
  console.log("app init");
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
    [ConvexProvider, { client: convex }],
    [PageProvider],
    [UserProvider],
    [EventProvider],
  ]);
  return (
    <Providers>
      <MainMenu />
      <NavController />
      {/* <PlayCenter /> */}
      <StackController />
    </Providers>
  );
}

export default App;

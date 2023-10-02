import { ConvexProvider, ConvexReactClient } from "convex/react";
import NavController from "./component/NavController";
import StackController from "./component/StackController";
import { CoordProvider } from "./service/CoordManager";
import { EventProvider } from "./service/EventManager";
import { PageProvider } from "./service/PageManager";
import { UserProvider } from "./service/UserManager";

const convex = new ConvexReactClient("https://dazzling-setter-839.convex.cloud");
function App() {
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
    [EventProvider],
    [UserProvider],
    [PageProvider],
  ]);
  return (
    <Providers>
      {/* <UserEventHandler /> */}
      <NavController />
      <StackController />
    </Providers>
  );
}

export default App;

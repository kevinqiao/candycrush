import { ClerkProvider, SignIn, useAuth, useClerk } from "@clerk/clerk-react";
import { useConvex } from "convex/react";
import React, { useEffect, useMemo } from "react";
import useEventSubscriber from "service/EventManager";
import { usePageManager } from "service/PageManager";
import usePartnerManager from "service/PartnerManager";
import { useUserManager } from "service/UserManager";
import { buildNavURL } from "util/PageUtils";
import { api } from "../../../convex/_generated/api";
import { AuthProps } from "../SSOController";

const AuthorizeToken: React.FC<AuthProps> = ({ authenticator }) => {
  const { signOut } = useClerk();
  const { app } = usePartnerManager();
  const { getToken, isSignedIn } = useAuth();
  const { user, authComplete } = useUserManager();
  const { event: accountEvent } = useEventSubscriber([], ["account"]);

  const { partner } = usePartnerManager();
  const { currentPage } = usePageManager();
  // const [redirectURL, setRedirectURL] = useState<string | null>(null);
  const convex = useConvex();
  // useEffect(() => {
  //   if (!user) {
  //     console.log(window.location.pathname);
  //     setRedirectURL(window.location.pathname);
  //   }
  // }, [user]);
  const redirectURL = useMemo(() => {
    if (app && currentPage) {
      console.log(app);
      if (app.partnerId > 0) {
        currentPage.params
          ? (currentPage.params["partner"] = app.partnerId)
          : (currentPage.params = { partnerId: app.partnerId });
      }
      console.log(currentPage);
      const url = buildNavURL(currentPage);
      console.log(url);
      return url;
    }
    // const appConfig = getCurrentAppConfig();
    // if (appConfig) return appConfig.context;
  }, [app, user, currentPage]);
  useEffect(() => {
    if (user && isSignedIn) {
      signOut();
    }
  }, [user, isSignedIn, signOut]);
  useEffect(() => {
    if (accountEvent && accountEvent?.name === "logout") {
      console.log("account logout");
      signOut();
    }
  }, [accountEvent, signOut]);
  useEffect(() => {
    const channelAuth = async () => {
      const t: string | null = await getToken();
      if (t && partner) {
        // const res = await convex.action(api.authoize.authorizeClerk, { jwttoken: t, partner: partner.pid });
        const res = await convex.action(api.authoize.authorize, {
          data: { jwttoken: t },
          channelId: authenticator.channel,
          partnerId: partner.pid,
        });
        if (res?.ok) {
          authComplete(res.message);
        }
      }
    };
    if (partner && isSignedIn) {
      channelAuth();
    }
  }, [isSignedIn, partner, signOut]);
  return (
    <>
      {!isSignedIn && redirectURL ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
          }}
        >
          {/* <div style={{ fontSize: "20px", color: "blue" }}>Welcome!</div> */}
          <SignIn redirectUrl={redirectURL} afterSignInUrl={redirectURL} />
        </div>
      ) : null}
    </>
  );
};
const ClerkAuthenticator: React.FC<AuthProps> = ({ authenticator }) => {
  return (
    <ClerkProvider publishableKey="pk_test_bGVuaWVudC1sb3VzZS04Ni5jbGVyay5hY2NvdW50cy5kZXYk">
      <AuthorizeToken authenticator={authenticator} />
    </ClerkProvider>
  );
};

export default ClerkAuthenticator;

import { ClerkProvider, SignIn, useAuth, useClerk } from "@clerk/clerk-react";
import React, { useEffect } from "react";
import useEventSubscriber from "service/EventManager";
import { useUserManager } from "service/UserManager";
import { useAuthorize } from "../useAuthorize";
const AuthorizeToken = () => {
  const { signOut } = useClerk();
  const { getToken, isSignedIn } = useAuth();
  const { authClerk } = useAuthorize();
  const { authComplete } = useUserManager();
  const { event: accountEvent } = useEventSubscriber([], ["account"]);
  useEffect(() => {
    if (accountEvent?.name === "logout") {
      console.log("account logout");
      signOut();
    }
  }, [accountEvent]);
  useEffect(() => {
    const channelAuth = async () => {
      let res;
      if (isSignedIn) {
        const t: string | null = await getToken();
        if (t) res = await authClerk(t, 1);
      }
      console.log(res);
      if (res?.status === "success") {
        authComplete(res.message);
      }
    };
    channelAuth();
  }, [isSignedIn]);
  return (
    <>
      {!isSignedIn ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100vh",
            backgroundColor: "black",
          }}
        >
          <div style={{ fontSize: "20px", color: "blue" }}>Welcome!</div>
          <SignIn redirectUrl={"/match3"} afterSignInUrl={"/match3"} />
        </div>
      ) : null}
    </>
  );
};
const ClerkAuth: React.FC = () => {
  return (
    <ClerkProvider publishableKey="pk_test_bGVuaWVudC1sb3VzZS04Ni5jbGVyay5hY2NvdW50cy5kZXYk">
      <AuthorizeToken />
    </ClerkProvider>
  );
};

export default ClerkAuth;

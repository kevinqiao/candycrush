import { SignedIn, SignedOut, SignIn, useAuth, useClerk } from "@clerk/clerk-react";
import PageProps from "model/PageProps";
import React, { useEffect, useMemo } from "react";
import { useSSOManager } from "service/SSOManager";

const Signin: React.FC<PageProps> = (pageProp) => {
  const { signOut } = useClerk();
  const { user, sessionCheck, authComplete } = useSSOManager();
  const { getToken, isSignedIn } = useAuth();
  console.log(isSignedIn);
  useEffect(() => {
    const fetchDataFromExternalResource = async () => {
      const token = await getToken();
      if (!token) return;
      // const url = "http://localhost/clerk";
      const url = "https://telegram-bot-8bgi.onrender.com/clerk";
      const res = await fetch(url, {
        method: "GET", // 或 'POST', 'PUT', 'DELETE' 等
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 将 token 添加到请求头中
          mode: "cors",
        },
      });
      const json = await res.json();
      console.log(json);
      if (json.status === "success") {
        authComplete(json.message);
      } else {
        await signOut();
      }
    };
    if (isSignedIn && sessionCheck) {
      if (!user) fetchDataFromExternalResource();
    }
  }, [user, isSignedIn, sessionCheck, pageProp]);

  const redirectURL = useMemo(() => {
    const url = pageProp.data?.src
      ? window.location.pathname + "?redirect=" + pageProp.data.src
      : window.location.pathname;
    return url;
  }, [pageProp]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <SignedOut>{pageProp ? <SignIn redirectUrl={redirectURL} afterSignInUrl={redirectURL} /> : null}</SignedOut>
      <SignedIn>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100vh",
            backgroundColor: "white",
          }}
        >
          <span style={{ fontSize: 20, color: "blue" }}>Authenticating...</span>
        </div>
      </SignedIn>
    </div>
  );
};

export default Signin;

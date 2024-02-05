import { SignedIn, SignedOut, SignIn, useAuth, useClerk } from "@clerk/clerk-react";
import React, { useEffect } from "react";
import { useUserManager } from "service/UserManager";
interface Props {
  disableCloseBtn?: () => void;
  close?: (type: number) => void;
}

const AuthHome: React.FC<Props> = ({ disableCloseBtn, close }) => {
  const { signOut } = useClerk();
  const { user, sessionCheck, authComplete } = useUserManager();
  const { getToken, isSignedIn } = useAuth();
  const url = window.location.href;
  console.log(url);
  console.log(user);
  useEffect(() => {
    const fetchDataFromExternalResource = async () => {
      const token = await getToken();
      if (!token) return;
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
      if (json.status === "success") {
        authComplete(json.message);
        if (close) close(0);
      } else {
        signOut().then(() => {
          if (close) close(0);
        });
      }
    };
    if (isSignedIn && sessionCheck) {
      console.log(user);
      if (disableCloseBtn) disableCloseBtn();
      if (!user) fetchDataFromExternalResource();
      else if (close) close(0);
    }
  }, [isSignedIn, sessionCheck]);
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
      <SignedOut>
        <SignIn redirectUrl={url} afterSignInUrl={url} />
      </SignedOut>
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

export default AuthHome;

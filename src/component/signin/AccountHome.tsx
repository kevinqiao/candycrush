import gsap from "gsap";
import React, { useCallback, useEffect, useRef } from "react";
import { usePageManager } from "../../service/PageManager";
import { useUserManager } from "../../service/UserManager";
import Signout from "./Signout";
import "./signin.css";
const AccountHome: React.FC = () => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const signoutRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserManager();
  const { stacks, openPage } = usePageManager();
  useEffect(() => {
    gsap.to(maskRef.current, { duration: 0, autoAlpha: 0 });
    gsap.to(signoutRef.current, { duration: 0, autoAlpha: 0 });
  }, []);
  const openSignout = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 0.7, duration: 0.3 });
    tl.to(signoutRef.current, { autoAlpha: 1, duration: 0.3 });
    tl.play();
  };
  const closeSignout = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 0, duration: 0.3 });
    tl.to(signoutRef.current, { autoAlpha: 0, duration: 0.3 });
    tl.play();
  };
  const isActive = useCallback(() => {
    const stack = stacks.find((s) => s.name === "signin");
    if (stack) return false;
    else return true;
  }, [stacks]);
  return (
    <div style={{ position: "relative", top: 0, left: 0, width: "100%", height: "100%" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100vh",
          backgroundColor: "red",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {user ? <div>{user.name}</div> : null}
        {user && !user.authEmbed ? (
          <div
            className="signin-btn"
            onClick={(e) => {
              openSignout();
            }}
          >
            Signout
          </div>
        ) : null}
        {!user ? (
          <div
            className="signin-btn"
            onClick={(e) => {
              openPage({ name: "signin", data: {} });
            }}
          >
            SignIn
          </div>
        ) : null}
      </div>

      <div
        ref={maskRef}
        className="mask"
        style={{ opacity: 0, width: "100%", height: "100%", backgroundColor: "black" }}
      ></div>

      <div
        ref={signoutRef}
        style={{
          position: "absolute",
          opacity: 0,
          top: 0,
          left: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {user && isActive() ? <Signout onComplete={closeSignout} onCancel={closeSignout} /> : null}
      </div>
    </div>
  );
};

export default AccountHome;

import Signout from "component/signin/Signout";
import gsap from "gsap";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import useCoord from "service/CoordManager";
import { usePageManager } from "service/PageManager";
import { useUserManager } from "service/UserManager";
import PageProps from "../../model/PageProps";
const W3Home: React.FC<PageProps> = (prop) => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const signoutRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useCoord();
  const { stacks, openPage } = usePageManager();
  const { user } = useUserManager();

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
  const render = useMemo(() => {
    return (
      <div style={{ position: "relative", width, height, backgroundColor: "blue" }}>
        <iframe
          src={"https://pixels.xyz"}
          width={"100%"}
          height={"100%"}
          title={"pixels"}
          frameBorder={0}
          allowFullScreen={true} // 使用该属性
        />

        {user ? (
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              zIndex: 10000,
              top: 50,
              right: 55,
              width: 250,
              height: 60,
              backgroundColor: "red",
              color: "white",
            }}
            onClick={(e) => {
              openSignout();
            }}
          >
            <span style={{ fontSize: 25 }}>Logout</span>
          </div>
        ) : (
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              zIndex: 10000,
              top: 50,
              right: 55,
              width: 250,
              height: 60,
              backgroundColor: "red",
              color: "white",
            }}
            onClick={(e) => {
              // openPage({ name: "signin", data: {} });
              window.location.href = "/match3/playcenter/tournament/home";
            }}
          >
            <span style={{ fontSize: 25 }}>Login</span>
          </div>
        )}
        <div
          ref={maskRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            opacity: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "black",
          }}
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
  }, [prop, height, user]);
  return <>{render}</>;
};

export default W3Home;

import SSOSignout from "component/signin/SSOSignout";
import gsap from "gsap";
import React, { useEffect, useMemo, useRef } from "react";
import useCoord from "service/CoordManager";
import { usePageManager } from "service/PageManager";
import { useSSOManager } from "service/SSOManager";
import PageProps from "../../model/PageProps";
const W3Home: React.FC<PageProps | null> = (prop) => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const signoutRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useCoord();
  const { openPage } = usePageManager();
  const { user } = useSSOManager();
  // useEffect(() => {
  //   console.log(user);
  //   const searchParams = new URLSearchParams(location.search);
  //   for (const param of searchParams) {
  //     console.log(param);
  //     if (user?.uid && param[0] === "redirect") window.location.href = param[1];
  //   }
  // }, [user]);
  useEffect(() => {
    const messageHandler = (event: any) => {
      if (event.origin !== "http://localhost:3000") {
        return;
      }
      if (event.data.type === "test") {
        if (user?.uid) window.location.href = "/match3/playcenter/battle/home";
        else openPage({ name: "signin", data: { src: "/match3" } });
        // window.location.href = "/match3/playcenter/battle/home";
        // console.log("Received message:", event.data);
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, [user]);
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

  const render = useMemo(() => {
    return (
      <div style={{ position: "relative", width, height, margin: 0, backgroundColor: "blue" }}>
        <iframe
          src={"http://localhost:3000/www.html"}
          width={"100%"}
          height={"100%"}
          title={"pixels"}
          style={{ border: "none", margin: "0px 0px 0px 0px" }}
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
              openPage({ name: "signin", data: {} });
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
          {user ? <SSOSignout onComplete={closeSignout} onCancel={closeSignout} /> : null}
        </div>
      </div>
    );
  }, [prop, height, user]);
  return <>{render}</>;
};

export default W3Home;

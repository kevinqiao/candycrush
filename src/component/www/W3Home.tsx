import { useAuth } from "@clerk/clerk-react";
import SSOSignout from "component/signin/SSOSignout";
import gsap from "gsap";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import useCoord from "service/CoordManager";
import { usePageManager } from "service/PageManager";
import { useSSOManager } from "service/SSOManager";
import PageProps from "../../model/PageProps";
import "./www.css";
const W3Home: React.FC<PageProps | null> = (prop) => {
  const maskRef = useRef<HTMLDivElement | null>(null);
  const signoutRef = useRef<HTMLDivElement | null>(null);
  const { width, height } = useCoord();
  const { openPage } = usePageManager();
  const { isSignedIn } = useAuth();
  const { user } = useSSOManager();

  useEffect(() => {
    const messageHandler = (event: any) => {
      // if (event.origin !== "http://localhost:3000") {
      //   return;
      // }
      if (event.data.type === "test") {
        if (user?.uid) window.location.href = "/match3/playcenter/battle/home";
        else openPage({ name: "signin", data: { src: "/match3" } });
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
    tl.to(signoutRef.current, { autoAlpha: 1, duration: 0.3 }, "<");
    tl.play();
  };
  const closeSignout = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(maskRef.current, { autoAlpha: 0, duration: 0.3 });
    tl.to(signoutRef.current, { autoAlpha: 0, duration: 0.3 }, "<");
    tl.play();
  };
  const login = useCallback(() => {
    if (!isSignedIn) openPage({ name: "signin", data: {} });
  }, [isSignedIn]);

  const playNow = useCallback(() => {
    if (user?.uid) window.location.href = "/match3/playcenter/battle/home";
    else openPage({ name: "signin", data: { src: "/match3" } });
  }, [user, isSignedIn]);
  const render = useMemo(() => {
    return (
      <div style={{ position: "relative", width, height, margin: 0, backgroundColor: "blue" }}>
        <iframe
          src={"https://pixels.xyz"}
          width={"100%"}
          height={"100%"}
          title={"pixels"}
          style={{ border: "none", margin: "0px 0px 0px 0px" }}
        />

        <div className="play_btn" onClick={playNow}>
          <span style={{ fontSize: 25 }}>Play Now</span>
        </div>
        <div ref={maskRef} className="mask_w3"></div>

        <div ref={signoutRef} className="signout_btn">
          {user?.uid ? <SSOSignout onComplete={closeSignout} onCancel={closeSignout} /> : null}
        </div>
      </div>
    );
  }, [prop, width, height, user]);
  return <>{render}</>;
};

export default W3Home;

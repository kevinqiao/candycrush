import PageProps from "model/PageProps";
import React, { useEffect } from "react";
import { usePageManager } from "service/PageManager";
import { useUserManager } from "service/UserManager";
import SlidePlayer from "./SlidePlayer";
import "./layout.css";

const colors = ["red", "green", "blue", "orange", "grey"];
const PlayCenter: React.FC<PageProps> = (prop) => {
  const { stacks, openPage } = usePageManager();
  const { userEvent } = useUserManager();

  useEffect(() => {
    if (userEvent) {
      const p = stacks.find((s) => s.name === "battlePlay");
      if (!p) openPage({ name: "battlePlay", ctx: "playplace", data: { act: "load", battle: userEvent?.data } });
    }
  }, [stacks, userEvent]);

  return <SlidePlayer></SlidePlayer>;
};

export default PlayCenter;

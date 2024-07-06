import { useQuery } from "convex/react";
import { BATTLE_LOAD } from "model/Constants";
import { PageItem } from "model/PageProps";
import { User } from "model/User";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { buildStackURL, getCurrentAppConfig, getURIParam } from "util/PageUtils";
import { api } from "../convex/_generated/api";
import useEventSubscriber from "./EventManager";
import { usePageManager } from "./PageManager";
import usePartnerManager from "./PartnerManager";
interface UserEvent {
  id: string;
  name: string;
  data: any;
}

interface IUserContext {
  user: any | null;
  userEvent: UserEvent | null;
  authComplete: (user: User) => void;
  logout: () => void;
  updateAsset: (asset: number, amount: number) => void;
  openPlay: (player: any, battleId: string | null) => void;
}

const UserContext = createContext<IUserContext>({
  user: null,
  userEvent: null,
  authComplete: () => null,
  logout: () => null,
  updateAsset: () => null,
  openPlay: () => null,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { stacks, openPage } = usePageManager();
  const [user, setUser] = useState<any>(null);
  const { createEvent } = useEventSubscriber([], ["account"]);
  const [lastTime, setLastTime] = useState<number>(0);
  const { app, partner } = usePartnerManager();
  // const authByToken = useAction(api.UserService.authByToken);

  const userEvent: any = useQuery(api.events.getByUser, {
    uid: user?.uid ?? "###",
    lastTime,
  });

  const openPlay = useCallback(
    (player: any, battleId: string | null) => {
      const appConfig: any = getCurrentAppConfig();

      const pageItem: PageItem = {
        name: "battlePlay",
        app: appConfig.name,
        data: battleId ? { battleId, load: BATTLE_LOAD.PLAY } : null,
        params: battleId ? { battleId, load: BATTLE_LOAD.PLAY } : null,
      };
      const mode = getURIParam("m");

      if (window.Telegram) {
        pageItem.params = { uid: player.uid, token: player.token, m: 1 };
        const url = buildStackURL(pageItem);
        window.Telegram.WebApp.openLink(url);
      } else if (mode && mode === "1") {
        pageItem.name = "lobbyPlay";
        openPage(pageItem);
      } else {
        pageItem.name = "battlePlay";
        const stack = stacks.find((s) => s.name === "battlePlay");
        if (!stack) openPage(pageItem);
      }
    },
    [openPage, stacks]
  );

  const authComplete = useCallback(
    (u: User) => {
      console.log(u);
      u.timelag = u.timestamp ? u.timestamp - Date.now() : 0;
      const mode = getURIParam("m"); //mode=1 one time play session

      if (!mode) {
        localStorage.setItem("user", JSON.stringify({ uid: u.uid, token: u.token }));
        console.log("complete persist user");
      }
      if (u.battleId) {
        openPlay(u, u.battleId);
      } else if (u["insearch"]) {
        console.log("open search event create");
        createEvent({ name: "searchOpen", topic: "search", delay: 0 });
      }
      if (u.timestamp) setLastTime(u.timestamp);
      setUser(u);
    },

    [stacks]
  );
  const updateAsset = useCallback(
    (asset: number, amount: number) => {
      if (user.assets) {
        const as = user.assets.find((a: { asset: number; amount: number }) => a.asset === asset);
        if (as) as.amount = as.amount + amount;
        else user.assets.push({ asset: asset, amount });
      }
    },
    [user]
  );
  const logout = useCallback(() => {
    console.log(app);
    if (app) {
      localStorage.removeItem("user");
      setUser(null);
      openPage({ name: "playcenter", app: app.name });
    }
  }, [app, createEvent]);
  useEffect(() => {
    if (userEvent && user) {
      console.log(userEvent);
      if (userEvent?.name === "battleCreated") {
        const { id: battleId } = userEvent.data;
        openPlay(user, battleId);
      } else if (userEvent?.name === "assetUpdated") {
        const { asset, amount } = userEvent.data;
        if (asset) {
          const as = user.assets.find((a: { asset: number; amount: number }) => a.asset === asset);
          if (as) as.amount = amount;
          else user.assets.push({ asset, amount });
        }
      }
      if (userEvent.time > lastTime) setLastTime(userEvent.time);
    }
  }, [user, userEvent]);

  const value = {
    user,
    userEvent,
    updateAsset,
    authComplete,
    openPlay,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
export const useUserManager = () => {
  const ctx = useContext(UserContext);

  return { ...ctx };
};
export default UserProvider;

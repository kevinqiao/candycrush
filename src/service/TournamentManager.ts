import { useAction, useConvex } from "convex/react";
import { Tournament } from "model/Tournament";
import { useCallback } from "react";
import { api } from "../convex/_generated/api";
import useCoord from "./CoordManager";
import { usePageManager } from "./PageManager";
import { useUserManager } from "./UserManager";


const useTournamentManager = () => {
  const { stacks, openPage } = usePageManager()
  const { user } = useUserManager();
  const { enviornment } = useCoord();

  const joinTournamentByGroup = useAction(api.tournamentService.joinTournamentByGroup);
  const convex = useConvex();
  const checkAuth = (): boolean => {
    return user && user.uid ? true : false
  }
  const askJoin = useCallback((tournament: Tournament) => {
    if (enviornment === 0) {
      console.log("in telegram mobile app")
    }
    console.log("enviornment:" + enviornment)
    if (!user) {
      openPage({
        name: "signin",
        data: { page: { name: "battlePlay", ctx: "playplace", data: { act: "join", tournament } } },
      });
      return;
    }
    const p = stacks.find((s) => s.name === "battlePlay");
    if (!p) openPage({ name: "battlePlay", ctx: "playplace", data: { act: "join", tournament } });
  }, [user, stacks, openPage]);

  const join = useCallback(async (tournament: Tournament) => {
    if (!checkAuth()) {
      openPage({ name: "signin", data: null })
      return;
    }
    await joinTournamentByGroup({ tid: tournament.id, uid: user.uid })

  }, [user])
  const listActives = useCallback(
    async (): Promise<any[]> => {
      const allOpens: any | null = await convex.query(api.tournaments.findAll);
      return allOpens;
    },
    []
  );

  return { askJoin, join, listActives };
};
export default useTournamentManager;

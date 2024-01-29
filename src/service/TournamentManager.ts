import { Id } from "convex/_generated/dataModel";
import { useAction, useConvex } from "convex/react";
import { Tournament } from "model/Tournament";
import { useCallback } from "react";
import { getTerminalType } from "util/useAgent";
import { api } from "../convex/_generated/api";
import { usePageManager } from "./PageManager";
import { useUserManager } from "./UserManager";


const useTournamentManager = () => {
  const { stacks, openPage } = usePageManager()
  const { user } = useUserManager();
  const joinTournamentByGroup = useAction(api.tournamentService.joinTournamentByGroup);
  const convex = useConvex();
  const checkAuth = (): boolean => {
    return user && user.uid ? true : false
  }
  const askJoin = useCallback((tournament: Tournament) => {

    if (!user) {
      openPage({
        name: "signin",
        data: { page: { name: "battlePlay", ctx: "playplace", data: { act: "join", tournament } } },
      });
      return;
    }
    const p = stacks.find((s) => s.name === "battlePlay");
    const ps = window.location.pathname.split("/");
    if ((ps[1] !== "tg" || getTerminalType() > 0) && !p) openPage({ name: "battlePlay", ctx: "playplace", data: { act: "join", tournamentId: tournament.id } });
  }, [user, stacks, openPage]);

  const join = useCallback(async (tournamentId: string) => {
    if (!checkAuth()) {
      openPage({ name: "signin", data: null })
      return;
    }
    await joinTournamentByGroup({ tid: tournamentId, uid: user.uid })
  }, [user])
  const listActives = useCallback(
    async (): Promise<any[]> => {
      const allOpens: any | null = await convex.query(api.tournaments.findAll);
      return allOpens;
    },
    [convex]
  );
  const findBattle = useCallback(
    async (battleId: Id<"battle">): Promise<any[]> => {
      const battle: any = await convex.query(api.battle.findBattle, { battleId });
      return battle;
    },
    [convex]
  );
  return { askJoin, join, listActives, findBattle };
};
export default useTournamentManager;

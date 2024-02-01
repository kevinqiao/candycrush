import { Id } from "convex/_generated/dataModel";
import { useAction, useConvex } from "convex/react";
import { useCallback } from "react";
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
  return { join, listActives, findBattle };
};
export default useTournamentManager;

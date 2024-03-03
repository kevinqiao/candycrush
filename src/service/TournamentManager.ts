import { Id } from "convex/_generated/dataModel";
import { useAction, useConvex } from "convex/react";
import { useCallback } from "react";
import { api } from "../convex/_generated/api";
import { usePageManager } from "./PageManager";
import { useUserManager } from "./UserManager";


const useTournamentManager = () => {
  const { openPage } = usePageManager()
  const { user } = useUserManager();
  const joinTournamentByGroup = useAction(api.tournamentService.joinTournamentByGroup);
  const convex = useConvex();

  const join = useCallback(async (tournamentId: string) => {
    console.log(user)
    if (!user || !user.uid) {
      console.log("openning signin")
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
    async (battleId: Id<"battle">): Promise<any> => {
      const battle: any = await convex.action(api.battle.findBattle, { battleId });
      console.log(battle)
      return battle;
    },
    [convex]
  );
  return { join, listActives, findBattle };
};
export default useTournamentManager;

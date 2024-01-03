import { useAction, useConvex, useQuery } from "convex/react";
import { Tournament } from "model/Tournament";
import { useCallback } from "react";
import { api } from "../convex/_generated/api";
import { usePageManager } from "./PageManager";
import { useUserManager } from "./UserManager";


const useTournamentManager = () => {
  const { openPage } = usePageManager()
  const { user } = useUserManager();

  const joinTournamentByGroup = useAction(api.tournamentService.joinTournamentByGroup);
  
  const convex = useConvex();
  const checkAuth = (): boolean => {
    return user && user.uid ? true : false
  }

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

  return {  join, listActives };
};
export default useTournamentManager;

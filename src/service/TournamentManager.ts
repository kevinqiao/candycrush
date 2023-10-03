import { useAction } from "convex/react";
import { useCallback } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { usePageManager } from "./PageManager";
import { useUserManager } from "./UserManager";


const useTournamentManager = () => {
  const { openPage } = usePageManager()
  const { user } = useUserManager();
  const joinTournament = useAction(api.tournamentService.joinTournament);
  const joinTournamentByType = useAction(api.tournamentService.joinTournamentByType);
  const findMyTournaments = useAction(api.tournamentService.findMyTournaments);

  const checkAuth = (act: string): boolean => {
    return user.uid ? true : false
  }
  const join = useCallback(
    async (tid: string, cid: number) => {
      const tournamentId = tid as Id<"tournament">;
      await joinTournament({ tournamentId, cid, uid: "kqiao" })
    },
    []
  );
  const joinByType = useCallback(
    async (cid: number) => {
      if (checkAuth("joinByType"))
        await joinTournamentByType({ cid, uid: "kqiao" })
      else
        openPage({ name: "signin", data: null })

    },
    [user]
  );
  const listActives = useCallback(
    async () => {
      const allOpens = await findMyTournaments({ uid: "kqiao" });
      return allOpens;
    },
    []
  );

  return { join, joinByType, listActives };
};
export default useTournamentManager;

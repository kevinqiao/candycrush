import { useAction, useConvex } from "convex/react";
import { useCallback, useEffect } from "react";
import { api } from "../convex/_generated/api";


const useTournamentManager = () => {

  const convex = useConvex();
  const joinTournament = useAction(api.tournamentService.joinTournament);
  const findActiveOpenByUser = useAction(api.tournamentService.findActiveOpenByUser);


  useEffect(() => {

  }, [convex]);

  const join = useCallback(
    async (tournamentId: string, cid: number) => {
      await joinTournament({ tournamentId, cid, uid: "kqiao" })
    },
    []
  );
  const listActives = useCallback(
    async () => {
      const allOpens = await findActiveOpenByUser({ uid: "kqiao" });
      return allOpens;
    },
    []
  );

  return { join, listActives };
};
export default useTournamentManager;

import { useAction, useConvex } from "convex/react";
import { useCallback, useEffect } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";


const useTournamentManager = () => {

  const convex = useConvex();
  const joinTournament = useAction(api.tournamentService.joinTournament);
  const joinTournamentByType = useAction(api.tournamentService.joinTournamentByType);
  const findMyTournaments = useAction(api.tournamentService.findMyTournaments);


  useEffect(() => {

  }, [convex]);

  const join = useCallback(
    async (tid: string, cid: number) => {
      const tournamentId = tid as Id<"tournament">;
      await joinTournament({ tournamentId, cid, uid: "kqiao" })
    },
    []
  );
  const joinByType = useCallback(
    async (cid: number) => {
      await joinTournamentByType({ cid, uid: "kqiao" })
    },
    []
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

import { useAction } from "convex/react";
import { useCallback } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { BATTLE_TYPE } from "../model/Constants";
import { TournamentDef } from "../model/TournamentCfg";
import { usePageManager } from "./PageManager";
import { useUserManager } from "./UserManager";


const useTournamentManager = () => {
  const { openPage } = usePageManager()
  const { user } = useUserManager();
  const joinTournament = useAction(api.tournamentService.joinTournament);
  const joinTournamentByGroup = useAction(api.tournamentService.joinTournamentByGroup);
  const joinTournamentByOneToOne = useAction(api.tournamentService.joinTournamentByOneToOne);
  const findMyTournaments = useAction(api.tournamentService.findMyTournaments);

  const checkAuth = (): boolean => {
    return user.uid ? true : false
  }
  const joinArena = useCallback(
    async (tid: string, cid: number) => {
      const tournamentId = tid as Id<"tournament">;
      await joinTournament({ tournamentId, cid, uid: "kqiao" })
    },
    []
  );

  const join = useCallback(async (tournament: TournamentDef) => {
    if (!checkAuth()) {
      openPage({ name: "signin", data: null })
      return;
    }
    console.log(tournament)
    if (tournament?.battleType === BATTLE_TYPE.SOLO) {
      await joinTournamentByGroup({ cid: tournament.id, uid: user.uid })
    } else if (tournament?.battleType === BATTLE_TYPE.SYNC)
      await joinTournamentByOneToOne({ cid: tournament.id, uid: user.uid })

  }, [user])
  const listActives = useCallback(
    async (): Promise<TournamentDef[]> => {
      const allOpens = await findMyTournaments({ uid: "kqiao" });
      return allOpens;
    },
    []
  );

  return { joinArena, join, listActives };
};
export default useTournamentManager;

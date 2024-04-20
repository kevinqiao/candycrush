import { Id } from "convex/_generated/dataModel";
import { useConvex } from "convex/react";
import { useCallback } from "react";
import { getCurrentAppConfig } from "util/PageUtils";
import { api } from "../convex/_generated/api";
import { usePageManager } from "./PageManager";
import { useUserManager } from "./UserManager";


const useTournamentManager = () => {
  const { openPage } = usePageManager()
  const { user } = useUserManager();
  const convex = useConvex();

  const join = useCallback(async (tournamentId: string): Promise<{ ok: boolean, code?: number } | null> => {

    if (!user || !user.uid) {
      openPage({ name: "signin", data: null })
      return null;
    } else {
      const rs = await convex.action(api.tournamentService.join, { uid: user.uid, token: user.token, tid: tournamentId })
      if (!rs.ok) {
        console.log(rs);
        return rs
      }
      const app = getCurrentAppConfig();
      openPage({ name: "battlePlay", ctx: app.context, data: {} })
      return rs
    }
    // setTimeout(async () =>
    //   await joinTournamentByGroup({ tid: tournamentId, uid: user.uid }), 5000)
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
      return battle;
    },
    [convex]
  );
  return { join, listActives, findBattle };
};
export default useTournamentManager;

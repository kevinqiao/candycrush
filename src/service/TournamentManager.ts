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

  const exit = useCallback(async (): Promise<void> => {
    await convex.action(api.tournamentService.exit, { uid: user.uid, token: user.token });
  }, [user])
  const join = useCallback(async (tournamentId: string): Promise<{ ok: boolean, code?: number } | null> => {
    await convex.action(api.tournamentService.join, { uid: user.uid, token: user.token, tid: tournamentId })
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
      const allOpens: any | null = await convex.query(api.tournaments.findAll, { uid: user.uid, token: user.token });
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
  return { join, exit, listActives, findBattle };
};
export default useTournamentManager;

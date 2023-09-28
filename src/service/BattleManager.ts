import { useAction, useConvex } from "convex/react";
import { useCallback, useEffect } from "react";
import { api } from "../convex/_generated/api";


const useBattleManager = () => {

  const convex = useConvex();

  const findMyBattles = useAction(api.tournamentService.findMyBattles);


  useEffect(() => {

  }, [convex]);

  const getMyBattles = useCallback(
    async () => {
      const battles: any = await findMyBattles({ uid: "kqiao" })
      return battles;
    },
    []
  );

  return { getMyBattles };
};
export default useBattleManager;

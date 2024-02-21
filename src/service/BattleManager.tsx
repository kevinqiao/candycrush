import React, { createContext, useCallback, useContext, useState } from "react";
import { BattleModel } from "../model/Battle";
import { useUserManager } from "./UserManager";

interface IBattleContext {
  battle: BattleModel | null;
  allGameLoaded: boolean;
  battleEvent: any;
  createBattleEvent: (event: any) => void;
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => void;
  loadGame: (gameId: string, data: any) => void;
}
const BattleContext = createContext<IBattleContext>({
  allGameLoaded: false,
  battle: null,
  battleEvent: null,
  createBattleEvent: () => null,
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => null,
  loadGame: (gameId: string, data: any) => null,
});

export const BattleProvider = ({ battle, children }: { battle: BattleModel | null; children: React.ReactNode }) => {
  const [allGameLoaded, setAllGameLoaded] = useState(false);
  // const { createAnimate } = useAnimateManager();
  const [battleEvent, setBattleEvent] = useState<any>(null);
  const { user } = useUserManager();

  // const event: GameEvent | undefined | null = useQuery(api.events.findByBattle, {
  //   battleId: battle?.id,
  // });

  // useEffect(() => {
  //   if (event && event["name"] === "battleOver") {
  //     if (battle) {
  //       battle.status = 1;
  //       battle.rewards = event["data"];
  //       setBattleEvent(event);
  //     }
  //   }
  // }, [event]);

  const value = {
    allGameLoaded,
    battle,
    battleEvent,
    createBattleEvent: useCallback(
      (event: any) => {
        // console.log(event);
        setBattleEvent(event);
      },
      [battle]
    ),
    completeGame: useCallback(
      (gameId: string, result: any) => {
        if (!battle || !battle.games) return;
        const game = battle?.games.find((g) => g.gameId === gameId);
        if (game && game.uid === user.uid) {
          game.result = result;
          setBattleEvent({ name: "battleOver", data: null });
        }
      },
      [battle]
    ),
    loadGame: useCallback(
      (gameId: string, data: any) => {
        if (!battle || !battle.games) return;
        const game = battle?.games.find((g) => g.gameId === gameId);
        if (game) {
          console.log(game);
          game.data = data;
          game.status = 1;
          if (battle.games.every((g) => g.status)) {
            setAllGameLoaded(true);
          }
        }
      },
      [battle]
    ),
  };

  return <BattleContext.Provider value={value}> {children} </BattleContext.Provider>;
};
export const useBattleManager = () => {
  return useContext(BattleContext);
};

export default BattleProvider;

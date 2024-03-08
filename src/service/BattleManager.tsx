import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BattleModel } from "../model/Battle";
import { useUserManager } from "./UserManager";

interface IBattleContext {
  battle: BattleModel | null;
  allGameLoaded: boolean;
  battleOver: number;
  // battleEvent: any;
  timeout: () => void;
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => void;
  loadGame: (gameId: string, data: any) => void;
}
const BattleContext = createContext<IBattleContext>({
  allGameLoaded: false,
  battle: null,
  battleOver: 0,
  // battleEvent: null,
  timeout: () => null,
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => null,
  loadGame: (gameId: string, data: any) => null,
});

export const BattleProvider = ({ battle, children }: { battle: BattleModel | null; children: React.ReactNode }) => {
  const [allGameLoaded, setAllGameLoaded] = useState(false);
  const [battleOver, setBattleOver] = useState(0);
  const { user } = useUserManager();

  useEffect(() => {
    if (!user || !battle) return;
    const mygame = battle.games?.find((g) => g.uid === user.uid);
    const timeLeft = battle.duration + battle.startTime - Date.now() + user.timelag;
    if (battle.status || mygame?.result || timeLeft < 0) setBattleOver(1);
  }, [battle, user]);

  const value = {
    allGameLoaded,
    battle,
    battleOver,
    // battleEvent,
    timeout: useCallback(() => {
      // console.log(event);
      setBattleOver(2);
    }, [battle]),
    completeGame: useCallback(
      (gameId: string, result: any) => {
        if (!battle || !battle.games) return;
        const game = battle?.games.find((g) => g.gameId === gameId);
        if (game && game.uid === user.uid) {
          game.result = result;
          setBattleOver(1);
        }
      },
      [battle]
    ),
    loadGame: useCallback(
      (gameId: string, data: any) => {
        if (!battle || !battle.games) return;
        const game = battle?.games.find((g) => g.gameId === gameId);
        if (game) {
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

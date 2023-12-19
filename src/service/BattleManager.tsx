import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { ANIMATE_NAME } from "../component/animation/AnimateConstants";
import { useAnimateManager } from "../component/animation/AnimateManager";
import BattleModel from "../model/Battle";
import { CellItem } from "../model/CellItem";

interface IBattleContext {
  battle: BattleModel | null;
  starttime: number;
  completeCandyMatch: (gameId: string, matches: { toRemove: CellItem[] }[]) => void;
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => void;
}
const BattleContext = createContext<IBattleContext>({
  starttime: Date.now(),
  battle: null,
  completeCandyMatch: (gameId: string, matches: { toRemove: CellItem[] }[]) => null,
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => null,
});

export const BattleProvider = ({ battle, children }: { battle: BattleModel | null; children: React.ReactNode }) => {
  const startTimeRef = useRef<number>(Date.now());
  const { createAnimate } = useAnimateManager();
  useEffect(() => {
    if (battle) {
      startTimeRef.current = Date.now() - battle.pasttime ?? 0;
      if (!battle.load) {
        console.log(battle);
        createAnimate({ id: Date.now(), name: ANIMATE_NAME.BATTLE_SEARCH });
        setTimeout(() => createAnimate({ id: Date.now(), name: ANIMATE_NAME.BATTLE_MATCHED, data: battle }), 5000);
      }
    }
  }, [battle, createAnimate]);

  const value = {
    starttime: startTimeRef.current,
    battle,
    completeCandyMatch: useCallback(
      (gameId: string, matches: { toRemove: CellItem[] }[]) => {
        if (!battle || !battle.games) return;
        const game = battle?.games.find((g) => g.gameId === gameId);
        if (game) {
          if (!game.matched) game.matched = [];
          for (let match of matches) {
            const { toRemove } = match;
            toRemove.forEach((c: CellItem) => {
              const md = game.matched.find((a) => a.asset === c.asset);
              md ? md.quantity++ : game.matched.push({ asset: c.asset, quantity: 1 });
            });
          }
        }
      },
      [battle]
    ),
    completeGame: useCallback(
      (gameId: string, score: { base: number; time: number; goal: number }) => {
        if (!battle || !battle.games) return;
        const game = battle?.games.find((g) => g.gameId === gameId);
        if (game) game.score = score;
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

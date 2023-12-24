import { useQuery } from "convex/react";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ANIMATE_NAME } from "../component/animation/AnimateConstants";
import { useAnimateManager } from "../component/animation/AnimateManager";
import { api } from "../convex/_generated/api";
import BattleModel from "../model/Battle";
import { CellItem } from "../model/CellItem";
import { GameEvent } from "../model/GameEvent";

interface IBattleContext {
  battle: BattleModel | null;
  starttime: number;
  battleOver: any;
  completeCandyMatch: (gameId: string, matches: { toRemove: CellItem[] }[]) => void;
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => void;
}
const BattleContext = createContext<IBattleContext>({
  starttime: Date.now(),
  battle: null,
  battleOver: null,
  completeCandyMatch: (gameId: string, matches: { toRemove: CellItem[] }[]) => null,
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => null,
});

export const BattleProvider = ({ battle, children }: { battle: BattleModel | null; children: React.ReactNode }) => {
  const startTimeRef = useRef<number>(Date.now());
  const { createAnimate } = useAnimateManager();
  const [battleOver, setBattleOver] = useState(null);
  const event: GameEvent | undefined | null = useQuery(api.events.findByBattle, {
    battleId: battle?.id,
  });
  useEffect(() => {
    if (event && event["name"] === "battleOver") setBattleOver(event["data"]);
  }, [event]);
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
    battleOver,
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

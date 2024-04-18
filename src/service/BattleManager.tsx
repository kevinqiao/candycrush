import { BATTLE_EVENT, BATTLE_LOAD } from "model/Constants";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getDualBounds, getMonoBounds } from "util/BattleBoundUtil";
import { BattleModel } from "../model/Battle";
import { useSceneManager } from "./SceneManager";
import { useUserManager } from "./UserManager";

interface IBattleContext {
  skill: number;
  load: number;
  battle: BattleModel | null;
  allGameLoaded: boolean;
  battleOver: number;
  battleEvent: any;
  bounds: { name: string; top: number; left: number; width: number; height: number; radius?: number }[] | null;
  setSkill: (skill: number) => void;
  reset: () => void;
  timeout: () => void;
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => void;
  loadGame: (gameId: string, data: any) => void;
}
const BattleContext = createContext<IBattleContext>({
  skill: 0,
  load: 0,
  allGameLoaded: false,
  battle: null,
  battleOver: 0,
  battleEvent: null,
  bounds: null,
  setSkill: (skill: number) => null,
  reset: () => null,
  timeout: () => null,
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => null,
  loadGame: (gameId: string, data: any) => null,
});

export const BattleProvider = ({ battle, children }: { battle: BattleModel | null; children: React.ReactNode }) => {
  const [skill, setSkill] = useState(0);
  const [allGameLoaded, setAllGameLoaded] = useState(false);
  const [battleOver, setBattleOver] = useState(0);
  const [battleEvent, setBattleEvent] = useState<{ name: string } | null>(null);
  const { user } = useUserManager();
  const { load, containerBound } = useSceneManager();
  // console.log("load:" + load);
  useEffect(() => {
    if (!user || !battle) return;
    const mygame = battle.games?.find((g) => g.uid === user.uid);
    const timeLeft = battle.duration + battle.startTime - Date.now() + user.timelag;
    if (battle.status || mygame?.result || timeLeft < 0) setBattleOver(1);
  }, [battle, user]);

  const bounds = useMemo(() => {
    if (!battle || !containerBound || load < 0) return null;
    const { column, row } = battle.data;
    const { width, height } = containerBound;
    const bs = load <= 1 ? getDualBounds(width, height, column, row) : getMonoBounds(width, height, column, row);
    return bs;
  }, [load, battle, containerBound]);

  const value = {
    skill,
    load,
    allGameLoaded,
    battle,
    battleOver,
    battleEvent,
    bounds,
    setSkill,
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
        // console.log("load game:" + gameId);
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
    reset: useCallback(() => {
      setAllGameLoaded(false);
    }, [battle]),
  };
  useEffect(() => {
    if (load === BATTLE_LOAD.REPLAY) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // console.log("tab visible");
        if (battle?.games) battle.games.forEach((g) => (g.status = 0));
        setAllGameLoaded(false);
        setBattleEvent({ name: BATTLE_EVENT.BATTLE_RELOAD });
      } else {
        console.log("tab invisible");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [load]);
  return <BattleContext.Provider value={value}> {children} </BattleContext.Provider>;
};
export const useBattleManager = () => {
  return useContext(BattleContext);
};

export default BattleProvider;

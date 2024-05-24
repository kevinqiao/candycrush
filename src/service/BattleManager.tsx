import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BattleModel } from "../model/Battle";
import { useSceneManager } from "./SceneManager";
import { useUserManager } from "./UserManager";

interface IBattleContext {
  currentSkill: number;
  load: number;
  battle: BattleModel | null;
  allGameLoaded: boolean;
  overReport: number;
  // bounds: { name: string; top: number; left: number; width: number; height: number; radius?: number }[] | null;
  setCurrentSkill: (skill: number) => void;
  setOverReport: (status: number) => void;
  reset: () => void;
  timeout: () => void;
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => void;
  loadGame: (gameId: string, data: any) => void;
}
const BattleContext = createContext<IBattleContext>({
  currentSkill: 0,
  load: 0,
  allGameLoaded: false,
  battle: null,
  overReport: 0,
  // bounds: null,
  setCurrentSkill: (skill: number) => {
    return;
  },
  setOverReport: (status: number) => {
    return;
  },
  reset: () => null,
  timeout: () => null,
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => null,
  loadGame: (gameId: string, data: any) => null,
});

export const BattleProvider = ({ battle, children }: { battle: BattleModel | null; children: React.ReactNode }) => {
  const [currentSkill, setCurrentSkill] = useState(0);
  const [allGameLoaded, setAllGameLoaded] = useState(false);
  const [overReport, setOverReport] = useState(0); //0-no report 1-my game is over(open game report) 2-battle is over (open battle report)
  const { user } = useUserManager();
  const { load } = useSceneManager();
  // console.log("load:" + load);
  useEffect(() => {
    if (!user || !battle) return;
    const mygame = battle.games?.find((g) => g.uid === user.uid);
    const timeLeft = battle.duration + battle.startTime - Date.now() + user.timelag;
    if (battle.rewards || battle.status || mygame?.result || timeLeft < 0) setOverReport(2);
  }, [battle, user]);

  const value = {
    currentSkill,
    load,
    allGameLoaded,
    battle,
    overReport,
    // bounds,
    setCurrentSkill,
    setOverReport,
    timeout: useCallback(() => {
      // console.log(event);
      if (overReport === 0) setOverReport(1);
    }, [battle]),
    completeGame: useCallback(
      (gameId: string, result: any) => {
        // if (!battle || !battle.games) return;
        // const game = battle?.games.find((g) => g.gameId === gameId);
        // if (game && game.uid === user.uid) {
        //   game.result = result;
        //   setBattleOver(1);
        // }
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
            // playInitBattle(battle, null);
          }
        }
      },
      [battle]
    ),
    reset: useCallback(() => {
      setAllGameLoaded(false);
    }, [battle]),
  };

  return <BattleContext.Provider value={value}> {children} </BattleContext.Provider>;
};
export const useBattleManager = () => {
  return useContext(BattleContext);
};

export default BattleProvider;

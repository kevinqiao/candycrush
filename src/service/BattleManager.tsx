import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { BattleModel } from "../model/Battle";
import { useUserManager } from "./UserManager";

interface IBattleContext {
  battle: BattleModel | null;
  allGameLoaded: boolean;
  myGameOver: boolean;
  starttime: number;
  battleEvent: any;
  // completeCandyMatch: (gameId: string, matches: { toRemove: CellItem[] }[]) => void;
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => void;
  loadGame: (uid: string, gameId: string, data: any) => void;
}
const BattleContext = createContext<IBattleContext>({
  myGameOver: false,
  allGameLoaded: false,
  starttime: Date.now(),
  battle: null,
  battleEvent: null,
  // completeCandyMatch: (gameId: string, matches: { toRemove: CellItem[] }[]) => null,
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => null,
  loadGame: (uid: string, gameId: string, data: any) => null,
});

export const BattleProvider = ({ battle, children }: { battle: BattleModel | null; children: React.ReactNode }) => {
  const startTimeRef = useRef<number>(Date.now());
  const [allGameLoaded, setAllGameLoaded] = useState(false);
  const [myGameOver, setMyGameOver] = useState(false);
  // const { createAnimate } = useAnimateManager();
  const [battleEvent, setBattleEvent] = useState<any>(null);
  const { user } = useUserManager();
  console.log(battle);
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
    myGameOver,
    allGameLoaded,
    starttime: startTimeRef.current,
    battle,
    battleEvent,
    // completeCandyMatch: useCallback(
    //   (gameId: string, matches: { toRemove: CellItem[] }[]) => {
    //     if (!battle || !battle.games) return;
    //     const game = battle?.games.find((g) => g.gameId === gameId);
    //     if (game) {
    //       if (!game.matched) game.matched = [];
    //       for (const match of matches) {
    //         const { toRemove } = match;
    //         toRemove.forEach((c: CellItem) => {
    //           const md = game.matched.find((a) => a.asset === c.asset);
    //           md ? md.quantity++ : game.matched.push({ asset: c.asset, quantity: 1 });
    //         });
    //       }
    //     }
    //   },
    //   [battle]
    // ),
    completeGame: useCallback(
      (gameId: string, score: { base: number; time: number; goal: number }) => {
        if (!battle || !battle.games) return;
        const game = battle?.games.find((g) => g.gameId === gameId);
        if (game) {
          game.score = score;
          if (game.uid === user.uid) {
            setMyGameOver(true);
            // battle.status = 1;
          }
          // setBattleEvent({ name: "gameOver", data: { gameId, score } });
        }
      },
      [battle]
    ),
    loadGame: useCallback(
      (uid: string, gameId: string, data: any) => {
        if (!battle || !battle.games) return;
        const game = battle?.games.find((g) => g.gameId === gameId);
        if (game) {
          game.uid = uid;
          game.status = 1;
          game.data = data;
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

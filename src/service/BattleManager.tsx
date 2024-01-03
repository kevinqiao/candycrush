import { useQuery } from "convex/react";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ANIMATE_NAME } from "../component/animation/AnimateConstants";
import { useAnimateManager } from "../component/animation/AnimateManager";
import { api } from "../convex/_generated/api";
import BattleModel from "../model/Battle";
import { CellItem } from "../model/CellItem";
import { GameEvent } from "../model/GameEvent";
import { useUserManager } from "./UserManager";

interface IBattleContext {
  battle: BattleModel | null;
  starttime: number;
  battleEvent:any;
  completeCandyMatch: (gameId: string, matches: { toRemove: CellItem[] }[]) => void;
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => void;
  loadGame:(gameId:string,matched:{asset:number;quantity:number}[])=>void;
}
const BattleContext = createContext<IBattleContext>({
  starttime: Date.now(),
  battle: null,
  battleEvent:null,
  completeCandyMatch: (gameId: string, matches: { toRemove: CellItem[] }[]) => null,
  completeGame: (gameId: string, score: { base: number; time: number; goal: number }) => null,
  loadGame:(gameId:string,matched:{asset:number;quantity:number}[])=>null
});

export const BattleProvider = ({ battle, children }: { battle: BattleModel | null; children: React.ReactNode }) => {
  const startTimeRef = useRef<number>(Date.now());
  const { createAnimate } = useAnimateManager();
  const [battleEvent, setBattleEvent] = useState<any>(null);
  const {user} = useUserManager();
  const event: GameEvent | undefined | null = useQuery(api.events.findByBattle, {
    battleId: battle?.id,
  });
  console.log(battle)
  useEffect(() => {
    if (event && event["name"] === "battleOver"){
      if(battle){
        battle.status=1;
        battle.rewards = event['data'];
        setBattleEvent(event)
      }
    }
  }, [event]);
  useEffect(() => {
    if (battle) {
      startTimeRef.current = Date.now() - battle.pasttime ?? 0;
      if (!battle.load) {        
        createAnimate({ id: Date.now(), name: ANIMATE_NAME.BATTLE_SEARCH });
        setTimeout(() => createAnimate({ id: Date.now(), name: ANIMATE_NAME.BATTLE_MATCHED, data: battle }), 5000);
      }
    }
  }, [battle, createAnimate]);

  const value = {
    starttime: startTimeRef.current,
    battle,
    battleEvent,
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
        if (game) {
          game.score = score;
          if(game.uid===user.uid){
            battle.status=2;           
          }
          setBattleEvent({name:"gameOver",data:{gameId,score}})
        }        
      },
      [battle]
    ),
    loadGame: useCallback(
      (gameId:string,matched:{asset:number;quantity:number}[])=>{
        if (!battle || !battle.games) return;
        const game = battle?.games.find((g) => g.gameId === gameId);
        if (game) {
            game.status=1;
            game.matched=matched??[];
            if(battle.games.every((g)=>g.status))
                battle.status=1;
          setBattleEvent({name:"gameReady",data:{gameId}})        }   

      },[battle])
  };

  return <BattleContext.Provider value={value}> {children} </BattleContext.Provider>;
};

export const useBattleManager = () => {
  return useContext(BattleContext);
};

export default BattleProvider;

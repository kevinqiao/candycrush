import { useConvex, useQuery } from "convex/react";
import { GameModel } from "model/GameModel";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CellItem } from "../model/CellItem";
import { BATTLE_LOAD } from "../model/Constants";
import { GameEvent } from "../model/GameEvent";
import { useBattleManager } from "./BattleManager";
import * as GameEngine from "./GameEngine";
import { useSceneManager } from "./SceneManager";
import { useUserManager } from "./UserManager";
interface IGameContext {
  game: GameModel | null;
  gameEvent?: GameEvent | null;
  action: { act: number; id: number; status: number };
  doAct: (act: number, data: any) => Promise<any>;
}
const GameContext = createContext<IGameContext>({
  game: null,
  gameEvent: null,
  action: { act: 0, id: 0, status: -1 },
  doAct: async (act: number, data: any) => null,
});

export const GameProvider = ({ gameId, children }: { gameId: string; children: React.ReactNode }) => {
  const gameRef = useRef<GameModel | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastEventRef = useRef<any>({ steptime: 0 });
  const actionRef = useRef<{ act: number; id: number; status: number }>({ act: 0, id: 0, status: -1 });
  const [gameEvent, setGameEvent] = useState<GameEvent | null>(null);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const { load, battle, completeGame } = useBattleManager();
  const { visible } = useSceneManager();
  const [laststep, setLaststep] = useState(-1);
  const { user } = useUserManager();

  const events: GameEvent[] | undefined | null = useQuery(api.events.findByGame, {
    gameId,
    laststep,
    // laststep: load === BATTLE_LOAD.REPLAY ? -1 : laststep,
  });

  const convex = useConvex();
  // const doAct = useAction(api.gameService.doAct);

  const sync = useCallback(async () => {
    if (!battle?.data) return;

    let g: any;
    if (load === BATTLE_LOAD.PLAY || load === BATTLE_LOAD.RELOAD)
      g = await convex.query(api.games.findGame, {
        gameId: gameId as Id<"games">,
      });
    else if (load === BATTLE_LOAD.REPLAY && gameRef.current == null) {
      g = await convex.query(api.games.findInitGame, {
        gameId,
      });
      const allEvents = await convex.query(api.events.findAllByGame, {
        gameId,
      });
      if (allEvents) {
        startTimeRef.current = Date.now();
        setGameEvents(allEvents);
      }
    }

    if (g) {
      g.data.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row === b.row) return a.column - b.column;
        else return a.row - b.row;
      });
      if (gameRef.current) Object.assign(gameRef.current, g);
      else gameRef.current = g;
      if (load !== BATTLE_LOAD.REPLAY) setLaststep(g.laststep);
      setGameEvent({
        id: Date.now() + "" + Math.floor(Math.random() * 100),
        steptime: g.laststep,
        name: "initGame",
        data: g,
      });
    }
  }, [convex, gameId, battle]);

  const processEvents = useCallback(
    (eventList: any[]) => {
      let count = 0;
      if (!gameRef.current) return;
      for (const event of eventList) {
        if (event.name === "gameOver") {
          const result = event.data.result;
          gameRef.current.result = result;
          setGameEvent(event);
          completeGame(gameId, result);
        } else {
          lastEventRef.current = event;
          // console.log(event);
          setTimeout(() => {
            // console.log(event.steptime + ":" + laststep);
            if (event.steptime > laststep) {
              // console.log("actionId:" + event.actionId);
              if (event.actionId === actionRef.current.id) {
                actionRef.current.status = 2;
                // console.log("confirm action completed with id:" + event.actionId);
              }
              GameEngine.handleEvent(event.name, event.data, gameRef.current);
              setGameEvent(event);
              if (load !== BATTLE_LOAD.REPLAY) setLaststep(event.steptime);
            }
          }, 10 * count++);
        }
      }
    },
    [gameId, gameRef.current]
  );

  useEffect(() => {
    if (visible) sync();
  }, [visible, load, sync]);

  useEffect(() => {
    if (battle?.data.goal && events && events.length > 0) {
      processEvents(events);
    }
  }, [events, battle, gameRef.current]);

  useEffect(() => {
    if (gameEvents?.length === 0 || load !== BATTLE_LOAD.REPLAY) return;
    const timer = setInterval(() => {
      const pastTime = Date.now() - startTimeRef.current;
      const laststep = lastEventRef.current.steptime;
      // console.log(pastTime + ":" + laststep);
      if (pastTime - laststep > 500) {
        const pastEvents = gameEvents
          .filter((event) => event.steptime && event.steptime > laststep && event.steptime < pastTime)
          .sort((a, b) => a.steptime - b.steptime);
        // console.log(pastEvents);
        if (pastEvents?.length > 0) {
          processEvents(pastEvents);
        }
      }
    }, 400);
    return () => {
      clearInterval(timer);
    };
  }, [gameEvents, processEvents]);

  const value = {
    load,
    action: actionRef.current,
    game: gameRef.current,
    gameEvent,
    doAct: useCallback(
      async (act: number, data: any): Promise<{ ok: boolean } | null> => {
        const action = actionRef.current;
        if (user && load !== BATTLE_LOAD.REPLAY && action.status !== 0) {
          action.act = act;
          action.id = Date.now();
          action.status = 0;
          console.log(action);
          // setTimeout(async () => {
          const res = await convex.action(api.gameService.doAct, {
            act,
            actionId: action.id,
            uid: user.uid,
            token: user.token,
            gameId,
            data,
          });
          // const timeCost = Date.now() - action.id;
          // console.log("time cost:" + timeCost);
          if (res?.ok) action.status = 1;
          return res;
          // }, 1000);
        }
        return null;
      },
      [load, battle, user, convex, gameId]
    ),
  };

  return <GameContext.Provider value={value}> {children} </GameContext.Provider>;
};
export const useGameManager = () => {
  return useContext(GameContext);
};

export default GameProvider;

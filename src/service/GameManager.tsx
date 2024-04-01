import { useAction, useConvex, useQuery } from "convex/react";
import { GameModel } from "model/GameModel";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CellItem } from "../model/CellItem";
import { BATTLE_EVENT, BATTLE_LOAD } from "../model/Constants";
import { GameEvent } from "../model/GameEvent";
import { useBattleManager } from "./BattleManager";
import * as GameEngine from "./GameEngine";
interface IGameContext {
  game: GameModel | null;
  gameEvent?: GameEvent | null;
  // swapCell: (candyId: number, targetId: number) => Promise<any>;
  // smash: (candyId: number) => void;
  doAct: (gameId: string, data: any) => void;
}
const GameContext = createContext<IGameContext>({
  game: null,
  gameEvent: null,
  // swapCell: async (candyId: number, targetId: number) => null,
  // smash: (candyId: number) => null,
  doAct: async (gameId: string, data: any) => null,
});

export const GameProvider = ({ gameId, children }: { gameId: string; children: React.ReactNode }) => {
  const gameRef = useRef<GameModel | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastEventRef = useRef<any>({ steptime: 0 });
  const [gameEvent, setGameEvent] = useState<GameEvent | null>(null);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const { load, battle, battleEvent, completeGame } = useBattleManager();
  const [laststep, setLaststep] = useState(-1);

  const events: GameEvent[] | undefined | null = useQuery(api.events.findByGame, {
    gameId,
    laststep,
    // laststep: load === BATTLE_LOAD.REPLAY ? -1 : laststep,
  });

  const convex = useConvex();
  const doAct = useAction(api.gameService.doAct);

  const sync = useCallback(async () => {
    let g: any;
    if (load === BATTLE_LOAD.PLAY || load === BATTLE_LOAD.RELOAD)
      g = await convex.query(api.games.findGame, {
        gameId: gameId as Id<"games">,
      });
    else if (load === BATTLE_LOAD.REPLAY) {
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
  }, [convex, gameId]);

  const processEvents = useCallback(
    (eventList: any[]) => {
      let count = 0;
      for (const event of eventList) {
        if (event.name === "gameOver" && gameRef.current) {
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
    if (!battleEvent || battleEvent?.name === BATTLE_EVENT.BATTLE_RELOAD) sync();
    else if (battleEvent?.name === BATTLE_EVENT.BATTLE_PAUSE) {
      setLaststep(-1);
    }
  }, [battleEvent]);

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
    game: gameRef.current,
    gameEvent,
    doAct: useCallback(
      async (name: string, data: any): Promise<null> => {
        console.log("do action with load:" + load + " play:" + BATTLE_LOAD.PLAY);
        if (load !== BATTLE_LOAD.REPLAY) {
          console.log("send act requestion:" + gameId + ":" + name);

          await convex.action(api.gameService.doAct, {
            act: name,
            gameId,
            data,
          });
          // await doAct({
          //   sessionId: "12345",
          //   act: name,
          //   gameId: gameId as Id<"games">,
          //   data,
          // });
        }
        return null;
      },
      [load, battle, convex, gameId]
    ),
  };

  return <GameContext.Provider value={value}> {children} </GameContext.Provider>;
};
export const useGameManager = () => {
  return useContext(GameContext);
};

export default GameProvider;

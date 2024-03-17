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
  load: number;
  game: GameModel | null;
  gameEvent?: GameEvent | null;
  // swapCell: (candyId: number, targetId: number) => Promise<any>;
  // smash: (candyId: number) => void;
  doAct: (gameId: string, data: any) => void;
}
const GameContext = createContext<IGameContext>({
  load: BATTLE_LOAD.PLAY,
  game: null,
  gameEvent: null,
  // swapCell: async (candyId: number, targetId: number) => null,
  // smash: (candyId: number) => null,
  doAct: async (gameId: string, data: any) => null,
});

export const GameProvider = ({
  load,
  gameId,
  children,
}: {
  load: number;
  gameId: string;
  children: React.ReactNode;
}) => {
  const gameRef = useRef<GameModel | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastEventRef = useRef<any>({ steptime: 0 });
  const [gameEvent, setGameEvent] = useState<GameEvent | null>(null);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const { allGameLoaded, battle, battleEvent, completeGame } = useBattleManager();
  const [laststep, setLaststep] = useState(-1);

  const events: GameEvent[] | undefined | null = useQuery(api.events.findByGame, {
    gameId,
    laststep,
    // laststep: load === BATTLE_LOAD.REPLAY ? -1 : laststep,
  });

  const convex = useConvex();
  const doAct = useAction(api.gameService.doAct);

  const sync = useCallback(async () => {
    const g: any = await convex.query(api.games.findGame, {
      gameId: gameId as Id<"games">,
    });

    if (g) {
      g.data.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row === b.row) return a.column - b.column;
        else return a.row - b.row;
      });
      if (gameRef.current) Object.assign(gameRef.current, g);
      else gameRef.current = g;
      setLaststep(g.laststep);
      setGameEvent({
        id: Date.now() + "" + Math.floor(Math.random() * 100),
        steptime: g.laststep,
        name: "initGame",
        data: g,
      });
      // console.log("create init game event..." + g.gameId);
      //  loadGame(gameId, { matched: g.data.matched ?? [] });
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
          setTimeout(() => {
            if (event.steptime > laststep) {
              GameEngine.handleEvent(event.name, event.data, gameRef.current);
              setGameEvent(event);
              setLaststep(event.steptime);
            }
          }, 10 * count++);
        }
      }
    },
    [gameId, gameRef.current]
  );

  useEffect(() => {
    sync();
  }, [battle]);

  useEffect(() => {
    if (battleEvent?.name === BATTLE_EVENT.BATTLE_RELOAD) sync();
    else if (battleEvent?.name === BATTLE_EVENT.BATTLE_PAUSE) {
      setLaststep(-1);
    }
  }, [battleEvent]);

  // useEffect(() => {
  //   if (!gameId || !battle || !convex) return;
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === "visible") {
  //       console.log("tab visible");
  //       sync();
  //     } else {
  //       setLaststep(-1);
  //       console.log("tab invisible");
  //     }
  //   };
  //   sync();
  //   document.addEventListener("visibilitychange", handleVisibilityChange);

  //   return () => {
  //     console.log("remove listener for tab invisible");
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, [gameId, battle, convex]);

  useEffect(() => {
    if (battle?.data.goal && events && events.length > 0 && allGameLoaded) {
      processEvents(events);
    }
  }, [events, battle, gameRef.current, allGameLoaded]);

  // useEffect(() => {
  //   const loadInit = async () => {
  //     const g: any | null = await convex.query(api.games.findInitGame, {
  //       gameId,
  //     });
  //     if (g) {
  //       startTimeRef.current = Date.now();
  //       gameRef.current = g;
  //       setGameEvent({ id: "0", steptime: 0, name: "initGame", data: g });
  //     }
  //   };
  //   if (gameId && battle) {
  //     load === BATTLE_LOAD.REPLAY ? loadInit() : sync();
  //   }
  // }, [gameId, battle, convex, sync]);

  useEffect(() => {
    if (gameEvents?.length === 0 || !gameEvents) return;
    const timer = setInterval(() => {
      const pastTime = Date.now() - startTimeRef.current;
      const laststep = lastEventRef.current.steptime;

      if (pastTime - laststep > 500) {
        const pastEvents = gameEvents
          .filter((event) => event.steptime && event.steptime > laststep && event.steptime < pastTime)
          .sort((a, b) => a.steptime - b.steptime);
        if (pastEvents?.length > 0) {
          processEvents(pastEvents);
        }
      }
    }, 400);
    return () => {
      clearInterval(timer);
    };
  }, [gameEvents, processEvents]);

  useEffect(() => {
    const loadEvents = async () => {
      if (gameId) {
        const events = await convex.query(api.events.findAllByGame, {
          gameId,
        });
        if (events) {
          startTimeRef.current = Date.now();
          setGameEvents(events);
        }
      }
    };
    if (gameId && convex && load === BATTLE_LOAD.REPLAY) loadEvents();
  }, [load, convex, gameId]);

  const value = {
    load,
    game: gameRef.current,
    gameEvent,
    doAct: useCallback(
      async (name: string, data: any): Promise<null> => {
        // console.log("do action with load:" + load + " play:" + BATTLE_LOAD.PLAY);
        if (load !== BATTLE_LOAD.REPLAY) {
          doAct({
            sessionId: "12345",
            act: name,
            gameId: gameId as Id<"games">,
            data,
          });
        }
        return null;
      },
      [load, battle, doAct, gameId]
    ),
  };

  return <GameContext.Provider value={value}> {children} </GameContext.Provider>;
};
export const useGameManager = () => {
  return useContext(GameContext);
};

export default GameProvider;

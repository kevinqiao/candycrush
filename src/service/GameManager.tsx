import { useAction, useConvex, useQuery } from "convex/react";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAnimateManager } from "../component/animation/AnimateManager";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CellItem } from "../model/CellItem";
import { BATTLE_LOAD, GAME_ACTION } from "../model/Constants";
import { GameEvent } from "../model/GameEvent";
import { useBattleManager } from "./BattleManager";
import * as gameEngine from "./GameEngine";
interface IGameContext {
  starttime: number;
  uid: string | null;
  gameId: string | null;
  cells: CellItem[] | null;
  matched: { asset: number; quantity: number }[];
  laststep: number;
  lastCellId: number;
  status: number;
  gameEvent?: GameEvent | null;
  swapCell: (candyId: number, targetId: number) => Promise<any>;
  smash: (candyId: number) => void;
}
const GameContext = createContext<IGameContext>({
  starttime: 0,
  uid: null,
  gameId: null,
  cells: [],
  matched: [],
  laststep: -1,
  lastCellId: 0,
  status: 0,
  gameEvent: null,
  swapCell: async (candyId: number, targetId: number) => null,
  smash: (candyId: number) => null,
});
const initialState = {
  starttime: Date.now(),
  isReplay: false,
  gameId: null,
  matched: [],
  cells: [],
  score: 0,
  laststep: -1,
  status: 0,
};

const actions = {
  APPLY_MATCH: "APPLY_MATCH",
  INIT_GAME: "INIT_GAME",
  GAME_OVER: "GAME_OVER",
  SWAP_CELL: "SWAP_CELL",
  APPLY_SMASH: "APPLY_SMASH",
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case actions.GAME_OVER:
      return Object.assign({}, state, action.data, { status: 1 });
    case actions.INIT_GAME: {
      const pasttime = action.data?.pasttime ?? 0;
      const starttime = pasttime > 0 ? Date.now() - pasttime : Date.now();
      return Object.assign({}, state, { matched: [] }, action.data, { starttime });
    }
    case actions.SWAP_CELL:
      gameEngine.handleEvent(action.data.name, action.data.data, state);
      return Object.assign({}, state, {
        lastCellId: action.data.lastCellId,
        laststep: action.data.steptime,
      });
    case actions.APPLY_SMASH:
      gameEngine.handleEvent(action.data.name, action.data.data, state);
      return Object.assign({}, state, {
        lastCellId: action.data.lastCellId,
        laststep: action.data.steptime,
      });

    default:
      return state;
  }
};
export const GameProvider = ({
  load,
  game,
  children,
}: {
  load: number;
  game: { uid: string; gameId: string };
  children: React.ReactNode;
}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const startTimeRef = useRef<number>(Date.now());
  const lastEventRef = useRef<any>({ steptime: 0 });
  const [gameEvent, setGameEvent] = useState<GameEvent | null>(null);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const { battle, completeGame } = useBattleManager();
  const { createAnimate } = useAnimateManager();

  const events: GameEvent[] | undefined | null = useQuery(api.events.findByGame, {
    gameId: game.gameId,
    laststep: load === BATTLE_LOAD.REPLAY ? -1 : state.laststep,
  });

  const convex = useConvex();

  const doAct = useAction(api.gameService.doAct);

  const sync = useCallback(async () => {
    const g: any = await convex.action(api.games.findGame, {
      gameId: game.gameId,
    });
    if (g) {
      g.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row === b.row) return a.column - b.column;
        else return a.row - b.row;
      });

      dispatch({ type: actions.INIT_GAME, data: g });
      setGameEvent({
        id: Date.now() + "" + Math.floor(Math.random() * 100),
        steptime: g.laststep,
        name: "initGame",
        data: g,
      });
    }
  }, [convex, game]);

  const processEvents = useCallback((eventList: any[]) => {
    let count = 0;
    for (const event of eventList) {
      lastEventRef.current = event;
      setTimeout(() => {
        if (event.steptime > state.laststep) {
          const name = event.name;
          if (name === "gameOver") {
            dispatch({ type: actions.GAME_OVER, data: event });
            setGameEvent(event);
            completeGame(game.gameId, event.data.result);
          } else if (name === "cellSmeshed") {
            dispatch({ type: actions.APPLY_SMASH, data: event });
            setGameEvent(event);
            // completeCandyMatch(game.gameId, event.data.results);
          } else if (name === "cellSwapped") {
            dispatch({ type: actions.SWAP_CELL, data: event });
            setGameEvent(event);
            // completeCandyMatch(game.gameId, event.data.results);
          }
        }
      }, 10 * count++);
    }
  }, []);
  useEffect(() => {
    if (battle?.goal && events && events.length > 0) {
      processEvents(events);
    }
  }, [events, battle, state.matched]);
  useEffect(() => {
    const loadInit = async () => {
      const g: any | null = await convex.query(api.games.findInitGame, {
        gameId: game.gameId,
      });

      if (g) {
        startTimeRef.current = Date.now();
        dispatch({ type: actions.INIT_GAME, data: { gameId: game.gameId, ...g } });
        setGameEvent({ id: "0", steptime: 0, name: "initGame", data: g });
      }
    };
    if (game.gameId && battle) {
      load === BATTLE_LOAD.REPLAY ? loadInit() : sync();
    }
  }, [game, battle, convex, createAnimate, sync]);

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
      if (state.gameId) {
        const events = await convex.query(api.events.findAllByGame, {
          gameId: state.gameId,
        });
        if (events) {
          console.log(events);
          startTimeRef.current = Date.now();
          setGameEvents(events);
        }
      }
    };
    if (state.gameId && convex && load === BATTLE_LOAD.REPLAY) loadEvents();
  }, [load, convex, state.gameId]);

  const value = {
    score: state.score,
    starttime: state.starttime,
    uid: state.uid,
    gameId: game.gameId,
    status: state.status,
    cells: state.cells,
    matched: state.matched,
    laststep: state.laststep,
    lastCellId: state.lastCellId,
    gameEvent,
    swapCell: useCallback(
      async (candyId: number, targetId: number): Promise<any> => {
        if (load === BATTLE_LOAD.REPLAY) return;
        // swap({ gameId: state.gameId as Id<"games">, candyId: candyId, targetId: targetId });
        doAct({
          sessionId: "12345",
          act: GAME_ACTION.SWIPE_CANDY,
          gameId: state.gameId as Id<"games">,
          data: { candyId, targetId },
        });
      },
      [load, battle, doAct, state.gameId]
    ),
    smash: useCallback(
      async (candyId: number) => {
        // const cell = state.cells.find((c: CellItem) => c.id === candyId);
        // if (cell?.asset < 20) return;
        if (load !== BATTLE_LOAD.REPLAY) {
          // smash({ gameId: state.gameId as Id<"games">, candyId: candyId });
          doAct({ act: GAME_ACTION.SMASH_CANDY, gameId: state.gameId as Id<"games">, data: { candyId } });
        }
      },
      [state.gameId, battle, doAct, load]
    ),
  };

  return <GameContext.Provider value={value}> {children} </GameContext.Provider>;
};
export const useGameManager = () => {
  return useContext(GameContext);
};

export default GameProvider;

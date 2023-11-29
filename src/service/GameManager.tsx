import { useAction, useConvex, useQuery } from "convex/react";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CellItem } from "../model/CellItem";
import { BATTLE_TYPE } from "../model/Constants";
import { GameEvent } from "../model/GameEvent";
import { useBattleManager } from "./BattleManager";
interface IGameContext {
  starttime: number;
  uid: string | null;
  gameId: string | null;
  cells: CellItem[] | null;
  matched: { asset: number; quantity: number }[];
  laststep: number;
  lastCellId: number;
  status: number;
  score: { base: number; goal: number; time: number };
  gameEvent?: GameEvent | null;
  swapCell: (candyId: number, targetId: number) => Promise<any>;
  smash: (candyId: number) => void;
  findFreeCandies: (gameId: string, quantity: number) => Promise<CellItem[]>;
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
  score: { base: 0, goal: 0, time: 0 },
  gameEvent: null,
  swapCell: async (candyId: number, targetId: number) => null,
  smash: (candyId: number) => null,
  findFreeCandies: async (gameId: string, quantity: number) => [],
});
const initialState = {
  starttime: Date.now(),
  isReplay: false,
  pid: null,
  gameId: null,
  matched: [],
  cells: [],
  score: { base: 0, goal: 0, time: 0 },
  laststep: -1,
  status: 0,
};

const actions = {
  APPLY_MATCH: "APPLY_MATCH",
  INIT_GAME: "INIT_GAME",
  SWAP_CELL: "SWAP_CELL",
  APPLY_SMASH: "APPLY_SMASH",
};
const applyProcess = (
  res: { toCreate: CellItem[]; toChange: CellItem[]; toRemove: CellItem[]; toMove: CellItem[]; score?: number },
  state: any
) => {
  state.cells.sort((a: CellItem, b: CellItem) => {
    if (a.row === b.row) return a.column - b.column;
    else return a.row - b.row;
  });
  const { toCreate, toChange, toRemove, toMove, score } = res;
  // let recells = state.cells;
  if (toRemove) {
    const rids: number[] = toRemove.map((c: CellItem) => c.id);
    const acells: CellItem[] = state.cells.filter((c: CellItem) => !rids.includes(c.id));
    state.cells.length = 0;
    state.cells.push(...acells);
    for (let r of toRemove) {
      const mitem = state.matched.find((m: { asset: number; quantity: number }) => m.asset === r.asset);
      if (mitem) mitem.quantity++;
      else state.matched.push({ asset: r.asset, quantity: 1 });
    }
  }
  if (toCreate) {
    state.cells.push(...toCreate);
  }
  if (toChange) {
    toChange.forEach((c) => {
      const cell = state.cells.find((s: CellItem) => s.id === c.id);
      Object.assign(cell, c);
    });
  }

  if (toMove) {
    for (let m of toMove) {
      const cell = state.cells.find((c: CellItem) => c.id === m.id);
      if (cell) Object.assign(cell, m);
      else state.cells.push(m);
    }
  }

  if (state.score) {
    Object.assign(state.score, { base: score });
  } else state.score = { base: score, goal: 0, time: 0 };
  state.cells.sort((a: CellItem, b: CellItem) => {
    if (a.row === b.row) return a.column - b.column;
    else return a.row - b.row;
  });
};
const reducer = (state: any, action: any) => {
  switch (action.type) {
    case actions.INIT_GAME:
      const starttime = Date.now() - action.data.pasttime;
      // state.cells.push(...action.data.cells);
      return Object.assign({}, state, { matched: [] }, action.data, { starttime });

    case actions.SWAP_CELL:
      const { candy, target, results } = action.data.data;
      const scandy = state.cells.find((c: CellItem) => c.id === candy.id);
      if (scandy) Object.assign(scandy, candy);
      const starget = state.cells.find((c: CellItem) => c.id === target.id);
      if (starget) Object.assign(starget, target);
      const { lastCellId, steptime } = action.data;
      console.log("last cellid:" + lastCellId);
      results.forEach(
        (result: {
          toCreate: CellItem[];
          toChange: CellItem[];
          toRemove: CellItem[];
          toMove: CellItem[];
          score?: number;
        }) => applyProcess(result, state)
      );
      state.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row === b.row) return a.column - b.column;
        else return a.row - b.row;
      });

      return Object.assign({}, state, {
        lastCellId,
        matched: [...state.matched],
        laststep: steptime,
        score: { ...state.score },
      });
    case actions.APPLY_SMASH:
      const res = action.data.data.results;
      res.forEach(
        (result: {
          toCreate: CellItem[];
          toChange: CellItem[];
          toRemove: CellItem[];
          toMove: CellItem[];
          score?: number;
        }) => applyProcess(result, state)
      );
      state.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row === b.row) return a.column - b.column;
        else return a.row - b.row;
      });
      // // console.log(JSON.parse(JSON.stringify(state.cells)));
      return Object.assign({}, state, {
        lastCellId: action.data.lastCellId,
        matched: [...state.matched],
        laststep: action.data.steptime,
        score: { ...state.score },
      });

    default:
      return state;
  }
};
export const GameProvider = ({ gameId, children }: { gameId: string; children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const startTimeRef = useRef<number>(Date.now());
  const lastEventRef = useRef<any>({ steptime: 0 });
  const [gameEvent, setGameEvent] = useState<GameEvent | null>(null);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const { battle } = useBattleManager();

  const events: GameEvent[] | undefined | null = useQuery(api.events.getByGame, {
    gameId: state.gameId ?? undefined,
    laststep: battle?.type === 3 ? -1 : state.laststep,
  });

  const convex = useConvex();
  const swap = useAction(api.gameService.swipeCell);
  const smash = useAction(api.gameService.smash);
  useEffect(() => {
    if (events) {
      let count = 0;
      for (let event of events) {
        setTimeout(() => setGameEvent(event), 10 * count++);
      }
    }
  }, [events]);
  useEffect(() => {
    const sync = async () => {
      const g: any | null = await convex.query(api.games.findGame, {
        gameId: gameId as Id<"games">,
      });

      if (g) {
        g.cells.sort((a: CellItem, b: CellItem) => {
          if (a.row === b.row) return a.column - b.column;
          else return a.row - b.row;
        });

        const laststep = g.pasttime;
        dispatch({ type: actions.INIT_GAME, data: { ...g, laststep } });
        setGameEvent({ id: "0", steptime: 0, name: "initGame", data: g });
      }
    };
    const loadInit = async () => {
      const g: any | null = await convex.query(api.games.findInitGame, {
        gameId,
      });
      if (g) {
        startTimeRef.current = Date.now();
        dispatch({ type: actions.INIT_GAME, data: { gameId, ...g, pasttime: 0 } });
        setGameEvent({ id: "0", steptime: 0, name: "initGame", data: g });
      }
    };
    if (gameId && convex) {
      battle?.type === BATTLE_TYPE.REPLAY ? loadInit() : sync();
    }
  }, [gameId, convex]);
  useEffect(() => {
    if (gameEvent) {
      const event = gameEvent as GameEvent;
      if (event.steptime >= state.laststep) {
        const name = event.name;
        if (name === "cellSmeshed") {
          dispatch({ type: actions.APPLY_SMASH, data: event });
        } else if (name === "matchSolved") {
          dispatch({ type: actions.APPLY_MATCH, data: event });
        } else if (name === "cellSwapped") {
          console.log(JSON.parse(JSON.stringify(state.cells)));
          dispatch({ type: actions.SWAP_CELL, data: event });
        }
      }
    }
  }, [gameEvent]);

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
          lastEventRef.current = pastEvents[0];
          switch (pastEvents[0].name) {
            // case "matchSolved":
            //   dispatch({ type: actions.APPLY_MATCH, data: pastEvents[0] });
            //   setGameEvent(pastEvents[0]);
            //   break;
            case "cellSmeshed":
              dispatch({ type: actions.APPLY_SMASH, data: pastEvents[0] });
              setGameEvent(pastEvents[0]);
              break;
            case "cellSwapped":
              dispatch({ type: actions.SWAP_CELL, data: pastEvents[0] });
              setGameEvent(pastEvents[0]);
              break;
            default:
              break;
          }
        }
      }
    }, 400);
    return () => {
      clearInterval(timer);
    };
  }, [gameEvents]);
  useEffect(() => {
    const loadEvents = async () => {
      if (state.gameId) {
        const events = await convex.query(api.events.findAllByGame, {
          gameId: state.gameId,
        });
        if (events) {
          startTimeRef.current = Date.now();
          setGameEvents(events);
        }
      }
    };
    if (state.gameId && convex && battle?.type === BATTLE_TYPE.REPLAY) loadEvents();
  }, [convex, state.gameId]);

  const value = {
    score: state.score,
    starttime: state.starttime,
    uid: state.uid,
    gameId: state.gameId,
    status: state.status,
    cells: state.cells,
    matched: state.matched,
    laststep: state.laststep,
    lastCellId: state.lastCellId,
    gameEvent,
    swapCell: useCallback(
      async (candyId: number, targetId: number): Promise<any> => {
        swap({ gameId: state.gameId as Id<"games">, candyId: candyId, targetId: targetId });
      },
      [state.gameId, battle, swap]
    ),
    smash: useCallback(
      async (candyId: number) => {
        if (battle?.type !== BATTLE_TYPE.REPLAY) smash({ gameId: state.gameId as Id<"games">, candyId: candyId });
      },
      [state.gameId, battle, swap]
    ),
    findFreeCandies: useCallback(async (gameId: string, quantity: number) => {
      const candies: CellItem[] = await convex.query(api.gameService.findFreeCandies, {
        gameId: gameId as Id<"games">,
      });
      if (!candies) return [];
      return candies;
    }, []),
  };

  return <GameContext.Provider value={value}> {children} </GameContext.Provider>;
};
export const useGameManager = () => {
  return useContext(GameContext);
};

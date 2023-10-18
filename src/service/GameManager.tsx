import { useAction, useConvex, useQuery } from "convex/react";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CellItem } from "../model/CellItem";
import { GameEvent } from "../model/GameEvent";

interface IGameContext {
  starttime: number;
  isReplay: boolean;
  uid: string | null;
  gameId: string | null;
  cells: CellItem[] | null;
  matched: [];
  laststep: number;
  status: number;
  gameEvent?: GameEvent | null;
  swapCell: (candyId: number, targetId: number) => void;
}
const GameContext = createContext<IGameContext>({
  starttime: 0,
  isReplay: false,
  uid: null,
  gameId: null,
  cells: [],
  matched: [],
  laststep: -1,
  status: 0,
  gameEvent: null,
  swapCell: (candyId: number, targetId: number) => null,
});
const initialState = {
  starttime: Date.now(),
  isReplay: false,
  pid: null,
  gameId: null,
  matched: [],
  cells: [],
  laststep: -1,
  status: 0,
};

const actions = {
  APPLY_MATCH: "APPLY_MATCH",
  INIT_GAME: "INIT_GAME",
  SWAP_CELL: "SWAP_CELL",
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case actions.INIT_GAME:
      console.log(action.data.pasttime);
      const starttime = Date.now() - action.data.pasttime;
      return Object.assign({}, state, { matched: [] }, action.data, { starttime });

    case actions.SWAP_CELL:
      const { candy, target } = action.data.data;
      const scandy = state.cells.find((c: CellItem) => c.id === candy.id);
      if (scandy) Object.assign(scandy, candy);
      const starget = state.cells.find((c: CellItem) => c.id === target.id);
      if (starget) Object.assign(starget, target);
      state.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row === b.row) return a.column - b.column;
        else return a.row - b.row;
      });
      return Object.assign({}, state, { cells: state.cells, laststep: action.data.steptime });
    case actions.APPLY_MATCH:
      let recells = state.cells;
      // console.log(JSON.parse(JSON.stringify({ pid: state.pid, recells })));
      for (let res of action.data.data) {
        // console.log(res);
        const { toCreate, toRemove, toMove } = res;
        if (toRemove) {
          const rids: number[] = toRemove.map((c: CellItem) => c.id);
          recells = recells.filter((c: CellItem) => !rids.includes(c.id));
          for (let r of toRemove) {
            const mitem = state.matched.find((m: { asset: number; quantity: number }) => m.asset === r.asset);
            if (mitem) mitem.quantity++;
            else state.matched.push({ asset: r.asset, quantity: 1 });
          }
        }
        if (toMove) {
          for (let m of toMove) {
            const move = recells.find((c: CellItem) => c.id === m.id);
            if (move) Object.assign(move, m);
          }
        }
        if (toCreate) {
          recells.push(...toCreate);
        }
        recells.sort((a: CellItem, b: CellItem) => {
          if (a.row === b.row) return a.column - b.column;
          else return a.row - b.row;
        });
        // console.log(JSON.parse(JSON.stringify({ pid: state.pid, recells })));
      }
      console.log(state.matched);
      return Object.assign({}, state, { cells: recells, matched: [...state.matched], laststep: action.data.steptime });

    default:
      return state;
  }
};
export const GameProvider = ({
  battleId,
  gameId,
  isReplay,
  pid,
  children,
}: {
  battleId: string;
  gameId: string;
  isReplay: boolean;
  pid?: string;
  children: React.ReactNode;
}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const startTimeRef = useRef<number>(Date.now());
  const lastEventRef = useRef<any>({ steptime: 0 });
  const [replayEvent, setReplayEvent] = useState<GameEvent | null>(null);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);

  const gameEvent: GameEvent | undefined | null = useQuery(api.events.getByGame, {
    gameId: state.gameId ?? undefined,
    battleId,
    laststep: isReplay ? -1 : state.laststep,
  });

  const convex = useConvex();
  const swap = useAction(api.gameService.swipeCell);

  useEffect(() => {
    const sync = async () => {
      const g: any | null = await convex.query(api.games.findGame, {
        gameId: gameId as Id<"games">,
      });
      if (g) {
        dispatch({ type: actions.INIT_GAME, data: { pid, isReplay, ...g } });
      }
    };
    const loadInit = async () => {
      const g: any | null = await convex.query(api.games.findInitGame, {
        gameId,
      });
      if (g) dispatch({ type: actions.INIT_GAME, data: { pid, isReplay, gameId, ...g } });
    };
    if (gameId) {
      isReplay ? loadInit() : sync();
    }
  }, [gameId, convex]);
  useEffect(() => {
    if (gameEvent) {
      const event = gameEvent as GameEvent;
      if (event.steptime > state.laststep) {
        const name = event.name;
        switch (name) {
          case "matchSolved":
            dispatch({ type: actions.APPLY_MATCH, data: event });
            break;
          case "cellSwapped":
            dispatch({ type: actions.SWAP_CELL, data: event });
            break;
          default:
            break;
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
            case "matchSolved":
              dispatch({ type: actions.APPLY_MATCH, data: pastEvents[0] });
              setReplayEvent(pastEvents[0]);
              break;
            case "cellSwapped":
              dispatch({ type: actions.SWAP_CELL, data: pastEvents[0] });
              setReplayEvent(pastEvents[0]);
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
    if (state.gameId && convex && isReplay) loadEvents();
  }, [isReplay, convex, state.gameId]);

  const value = {
    starttime: state.starttime,
    isReplay: state.isReplay,
    uid: state.uid,
    gameId: state.gameId,
    status: state.status,
    cells: state.cells,
    matched: state.matched,
    laststep: state.laststep,
    gameEvent: isReplay ? replayEvent : gameEvent,
    swapCell: useCallback(
      async (candyId: number, targetId: number) => {
        if (!isReplay) swap({ gameId: state.gameId as Id<"games">, candyId: candyId, targetId: targetId });
      },
      [state.gameId, isReplay, swap]
    ),
  };

  return <GameContext.Provider value={value}> {children} </GameContext.Provider>;
};
export const useGameManager = () => {
  return useContext(GameContext);
};

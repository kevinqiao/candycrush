import { useAction, useConvex, useQuery } from "convex/react";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CellItem } from "../model/CellItem";
import { GameEvent } from "../model/GameEvent";
import { GameModel } from "../model/GameModel";

interface IGameContext {
  isReplay: boolean;
  gameId: string | null;
  cells: CellItem[] | null;
  status: number;
  gameEvent?: GameEvent | null;
  swapCell: (candyId: number, targetId: number) => void;
}
const GameContext = createContext<IGameContext>({
  isReplay: false,
  gameId: null,
  cells: [],
  status: 0,
  gameEvent: null,
  swapCell: (candyId: number, targetId: number) => null,
});
const initialState = {
  isReplay: false,
  pid: null,
  gameId: null,
  cells: [],
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
      return Object.assign({}, state, action.data);
    case actions.SWAP_CELL:
      const { candy, target } = action.data;
      const scandy = state.cells.find((c: CellItem) => c.id === candy.id);
      if (scandy) Object.assign(scandy, candy);
      const starget = state.cells.find((c: CellItem) => c.id === target.id);
      if (starget) Object.assign(starget, target);
      state.cells.sort((a: CellItem, b: CellItem) => {
        if (a.row === b.row) return a.column - b.column;
        else return a.row - b.row;
      });
      return Object.assign({}, state, { cells: state.cells });
    case actions.APPLY_MATCH:
      let recells = state.cells;
      // console.log(JSON.parse(JSON.stringify({ pid: state.pid, recells })));
      for (let res of action.data) {
        // console.log(res);
        const { toCreate, toRemove, toMove } = res;
        if (toRemove) {
          const rids: number[] = toRemove.map((c: CellItem) => c.id);
          recells = recells.filter((c: CellItem) => !rids.includes(c.id));
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

      return Object.assign({}, state, { cells: recells });

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
  const lastEventRef = useRef<GameEvent | null>(null);
  const [replayEvent, setReplayEvent] = useState<GameEvent | null>(null);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);

  const gameEvent: GameEvent | undefined | null = useQuery(api.events.getByGame, {
    gameId: state.gameId,
    battleId,
    replay: isReplay,
  });
  const convex = useConvex();
  const swap = useAction(api.gameService.swipeCell);

  useEffect(() => {
    const init = async () => {
      const g: GameModel | null = await convex.query(api.games.findInitGame, {
        gameId: gameId as Id<"games">,
      });
      dispatch({ type: actions.INIT_GAME, data: { pid, isReplay, ...g } });
    };
    if (gameId) {
      init();
    }
  }, [gameId, convex]);
  useEffect(() => {
    if (gameEvent && !isReplay) {
      const event = gameEvent as GameEvent;
      const name = event.name;
      switch (name) {
        case "matchSolved":
          dispatch({ type: actions.APPLY_MATCH, data: event.data });
          break;
        case "cellSwapped":
          dispatch({ type: actions.SWAP_CELL, data: event.data });
          break;
        default:
          break;
      }
    }
  }, [gameEvent]);

  useEffect(() => {
    if (gameEvents?.length === 0 || !gameEvents) return;
    const timer = setInterval(() => {
      const pastTime = Date.now() - startTimeRef.current;
      const stepTime = lastEventRef.current ? lastEventRef.current.steptime : 0;
      const pastEvents = gameEvents
        .filter((event) => event.steptime && event.steptime > stepTime && event.steptime <= pastTime)
        .sort((a, b) => a.steptime - b.steptime);
      if (pastEvents?.length > 0) {
        lastEventRef.current = pastEvents[0];
        switch (pastEvents[0].name) {
          case "matchSolved":
            dispatch({ type: actions.APPLY_MATCH, data: pastEvents[0].data });
            break;
          case "cellSwapped":
            dispatch({ type: actions.SWAP_CELL, data: pastEvents[0].data });
            break;
          default:
            break;
        }
        setReplayEvent(pastEvents[0]);
      }
    }, 200);
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
    isReplay: state.isReplay,
    gameId: state.gameId,
    status: state.status,
    cells: state.cells,
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

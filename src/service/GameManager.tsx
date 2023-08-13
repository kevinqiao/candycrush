import React, { createContext, useCallback, useContext, useEffect } from "react";
import { CellItem } from "../model/CellItem";
import { initGame, processMatch } from "./GameEngine";
const cellTypes = Array.from({ length: 7 }, (_, k) => k);
let cellId: number = 50;

interface IGameContext {
  cells: CellItem[];
  updateCells: (cells: CellItem[]) => void;
  handleMatch: (matches: any) => any;
}

const initialState = {
  cells: [],
};

const actions = {
  CREATE_CELLS: "CREATE_CELLS",
  REMOVE_CELLS: "REMOVE_CELLS",
  UPDATE_CELLS: "UPDATE_CELLS",
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case actions.CREATE_CELLS:
      return Object.assign({}, state, { cells: [...action.data] });
    case actions.REMOVE_CELLS:
      break;
    case actions.UPDATE_CELLS:
      const cells: CellItem[] = action.data;
      cells.forEach((c) => {
        const sc = state.cells.find((s: CellItem) => s.id === c.id);
        if (sc) Object.assign(sc, c);
      });
      return Object.assign({}, state, { cells: [...state.cells] });
    default:
      return state;
  }
};

const GameContext = createContext<IGameContext>({
  cells: [],
  updateCells: (cells: CellItem[]) => null,
  handleMatch: (matches: any) => {},
});

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  useEffect(() => {
    const cells = initGame();
    console.log(cells);
    dispatch({ type: actions.CREATE_CELLS, data: cells });
  }, []);

  const value = {
    cells: state.cells,
    updateCells: useCallback(
      (cells: CellItem[]) => {
        dispatch({ type: actions.UPDATE_CELLS, data: cells });
      },
      [state, dispatch]
    ),
    handleMatch: useCallback(
      (matches: { start: CellItem; end: CellItem; direction: number; size: number }) => {
        const res = processMatch(state.cells, matches);
        setTimeout(() => {
          let cells: CellItem[];
          if (res?.toRemoves) {
            cells = state.cells.filter((c: CellItem) => {
              const index = res.toRemoves.findIndex((r: CellItem) => r.id === c.id);
              return index >= 0 ? false : true;
            });
            res.toMoves.forEach((m: CellItem) => {
              const cell = cells?.find((c) => c.id === m.id);
              if (cell) Object.assign(cell, m);
            });
            const allCells = [...cells, ...res.toCreates];
            allCells.sort((a, b) => {
              if (a.row !== b.row) return a.row - b.row;
              else return a.column - b.column;
            });
            dispatch({ type: actions.CREATE_CELLS, data: allCells });
          }
        }, 2000);
        return res;
      },
      [state, dispatch]
    ),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameManager = () => {
  return useContext(GameContext);
};

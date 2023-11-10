import { useConvex } from "convex/react";
import React, { createContext, useCallback, useContext, useEffect } from "react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import BattleModel from "../model/Battle";
import { useUserManager } from "./UserManager";
interface GameScore {
  player: { uid: string; name: string };
  gameId: string;
  score: { base: number; goal: number; time: number };
}
interface IBattleContext {
  starttime: number;
  type: number;
  gamescores: GameScore[];
  updateScore: (gameId: string, score: number) => void;
}
const BattleContext = createContext<IBattleContext>({
  starttime: Date.now(),
  type: 0,
  gamescores: [],
  updateScore: (gameId: string, score: number) => null,
});
const initialState = {
  starttime: Date.now(),
  type: 0,
  gamescores: [],
};

const actions = {
  INIT_BATTLE: "INIT_BATTLE",
  SCORE_UPDATE: "SCORE_UPDATE",
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case actions.INIT_BATTLE:
      return Object.assign({}, state, action.data);
    case actions.SCORE_UPDATE:
      const { gameId, score } = action.data;
      if (gameId && score) {
        const gamescore = state.gamescores.find((s: GameScore) => s.gameId === gameId);

        if (gamescore) {
          gamescore.score.base = score;
          console.log(gamescore);
          return Object.assign({}, state, { gamescores: [...state.gamescores] });
        }
      }
      break;
    default:
      return state;
  }
};
export const BattleProvider = ({ battle, children }: { battle: BattleModel; children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { user } = useUserManager();
  const convex = useConvex();
  useEffect(() => {
    const sync = async () => {
      const b: any | null = await convex.query(api.battle.findBattle, {
        battleId: battle.id as Id<"battle">,
      });
      if (b) {
        console.log(b);
        dispatch({ type: actions.INIT_BATTLE, data: { ...b, starttime: Date.now() - b.pasttime } });
      }
    };
    // sync();
  }, [battle, convex]);

  const value = {
    starttime: state.starttime,
    type: state.type,
    gamescores: state.gamescores,
    updateScore: useCallback(
      (gameId: string, score: number) => {
        console.log(gameId + ":" + score);
        dispatch({ type: actions.SCORE_UPDATE, data: { gameId, score } });
      },
      [dispatch]
    ),
  };

  return <BattleContext.Provider value={value}> {children} </BattleContext.Provider>;
};

export const useBattleManager = () => {
  return useContext(BattleContext);
};

export default BattleProvider;

import React, { createContext, useContext, useEffect, useRef } from "react";
import { ANIMATE_NAME } from "../component/animation/AnimateConstants";
import { useAnimateManager } from "../component/animation/AnimateManager";
import BattleModel from "../model/Battle";

interface IBattleContext {
  battle: BattleModel | null;
  load: number; //0-new 1-reload
  starttime: number;
}
const BattleContext = createContext<IBattleContext>({
  starttime: Date.now(),
  load: 0,
  battle: null,
});

export const BattleProvider = ({
  battle,
  load,
  children,
}: {
  battle: BattleModel | null;
  load: number;
  children: React.ReactNode;
}) => {
  const startTimeRef = useRef<number>(Date.now());
  const { createAnimate } = useAnimateManager();
  useEffect(() => {
    createAnimate({ id: Date.now(), name: ANIMATE_NAME.BATTLE_SEARCH });
  }, []);
  useEffect(() => {
    if (battle) {
      const past = Date.now() - startTimeRef.current;
      setTimeout(
        () => createAnimate({ id: Date.now(), name: ANIMATE_NAME.BATTLE_MATCHED, data: battle }),
        past > 5000 ? 0 : 5000 - past
      );
    }
  }, [battle]);
  const value = {
    starttime: startTimeRef.current,
    battle,
    load,
  };

  return <BattleContext.Provider value={value}> {children} </BattleContext.Provider>;
};

export const useBattleManager = () => {
  return useContext(BattleContext);
};

export default BattleProvider;

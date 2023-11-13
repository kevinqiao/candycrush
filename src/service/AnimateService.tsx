import React, { createContext, useContext } from "react";
import { CellItem } from "../model/CellItem";

interface IAnimateContext {
  animates: Map<
    string, //scene name
    {
      scene: string;
      timeline: any;
      starttime: number;
    }
  >;
}
const AnimateContext = createContext<IAnimateContext>({
  animates: new Map(),
});

export const AnimateProvider = ({ children }: { children: React.ReactNode }) => {
  const value = {
    animates: new Map(),
  };
  return <AnimateContext.Provider value={value}> {children} </AnimateContext.Provider>;
};

export const useAnimateManager = () => {
  const { animates } = useContext(AnimateContext);
  const playSwipe = (
    gameId: string,
    candy: CellItem,
    target: CellItem,
    results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[]
  ) => {};
  const playSmesh = (
    gameId: string,
    candyId: number,
    results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[]
  ) => {};

  return { playSwipe, playSmesh };
};

export default AnimateProvider;

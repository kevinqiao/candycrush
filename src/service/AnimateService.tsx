import React, { createContext, useContext } from "react";
import BattleModel from "../model/Battle";

interface IAnimateContext {}
const AnimateContext = createContext<IAnimateContext>({});

export const AnimateProvider = ({ battle, children }: { battle: BattleModel; children: React.ReactNode }) => {
  const value = {};

  return <AnimateContext.Provider value={value}> {children} </AnimateContext.Provider>;
};

export const useAnimateManager = () => {
  return useContext(AnimateContext);
};

export default AnimateProvider;

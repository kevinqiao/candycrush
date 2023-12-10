import * as PIXI from "pixi.js";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { SceneModel } from "../../model/SceneModel";
import { useBattleAnimateHandler } from "./BattleAnimateHandler";
import { useGameAnimateHandler } from "./GameAnimateHandler";
export interface AnimateElement {
  name: string;
  type: number; //0-HTMLDivElement 1-PIXI.Container 2-PIXI.Sprite
  ele: HTMLDivElement | PIXI.Container | PIXI.Sprite | SceneModel;
}
export interface Animate {
  id: number;
  name: string;
  gameId?: string;
  timeline?: any;
  starttime?: number;
  duration?: number;
  status?: number; //0-open 1-complete
  eles?: AnimateElement[];
  data?: any;
}
export interface IAnimateContext {
  animates: Animate[];
  animateEvent: AnimateEvent | null;
  createAnimate: (animate: Animate) => void;
  updateAnimate: (name: string, data: any) => void;
  removeAnimate: (time: number) => void;
  checkIfAnimate: (gameId: string) => boolean;
}
export interface AnimateEvent {
  name: string;
  animateId: number;
  type?: number; //0-create 1-update
  time?: number;
  eles?: AnimateElement[];
  data?: any;
}
const AnimateContext = createContext<IAnimateContext>({
  animates: [],
  animateEvent: null,
  createAnimate: (animate: Animate) => null,
  updateAnimate: (name: string, data: any) => null,
  removeAnimate: (time: number) => null,
  checkIfAnimate: (gameId: string) => false,
});

export const AnimateProvider = ({ children }: { children: React.ReactNode }) => {
  const animatesRef = useRef<Animate[]>([]);
  const [animateEvent, setAnimateEvent] = useState<AnimateEvent | null>(null);

  const createAnimate = useCallback((animate: Animate) => {
    Object.assign(animate, { starttime: Date.now() });
    animatesRef.current.push(animate);
    setAnimateEvent({ name: animate.name, animateId: animate.id, type: 0 });
  }, []);
  const updateAnimate = (name: string, data: any) => {
    const animate = animatesRef.current.find((a) => a.name === name);
    if (animate) {
      Object.assign(animate, data);
      setAnimateEvent({ name: animate.name, animateId: animate.id, type: 1, data });
    }
  };
  const removeAnimate = (id: number) => {
    const as = animatesRef.current.filter((a) => a.id !== id);
    animatesRef.current.length = 0;
    animatesRef.current.push(...as);
  };
  const checkIfAnimate = useCallback(
    (gameId: string) => {
      const ganimate = animatesRef.current.find((a) => a.gameId === gameId && !a.status);
      if (ganimate) {
        return true;
      }
      return false;
    },
    [animatesRef]
  );
  const value = {
    animates: animatesRef.current,
    animateEvent,
    createAnimate,
    updateAnimate,
    removeAnimate,
    checkIfAnimate,
  };
  useBattleAnimateHandler(value);
  useGameAnimateHandler(value);
  return <AnimateContext.Provider value={value}> {children} </AnimateContext.Provider>;
};

export const useAnimateManager = () => {
  return useContext(AnimateContext);
};

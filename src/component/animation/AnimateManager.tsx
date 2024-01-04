import * as PIXI from "pixi.js";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { SceneModel } from "../../model/SceneModel";
import { ANIMATE_EVENT_TYPE } from "./AnimateConstants";
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
  battleId?: string;
  gameId?: string;
  timeline?: any;
  startTime?: number;
  status?: number; //0-open 1-in progress 2-complete
  eles?: AnimateElement[];
  data?: any;
}
export interface IAnimateHandleContext {
  animates: Animate[];
  animateEvent: AnimateEvent | null;
  createAnimate: (animate: Animate) => void;
  updateAnimate: (name: number, data: any) => void;
  removeAnimate: (time: number) => void;
  checkIfAnimate: (gameId: string) => boolean;
}
export interface IAnimateContext {
  animates: Animate[];
  // animateEvent: AnimateEvent | null;
  createAnimate: (animate: Animate) => void;
  updateAnimate: (name: number, data: any) => void;
  removeAnimate: (time: number) => void;
  checkIfAnimate: (gameId: string) => boolean;
  createEvent:(event:AnimateEvent)=>void;
}
export interface AnimateEvent {
  name: string;
  type?: number; //0-create 1-update
  time?: number;
  data?: any;
}
const AnimateContext = createContext<IAnimateContext>({
  animates: [],
  // animateEvent: null,
  createAnimate: (animate: Animate) => null,
  updateAnimate: (id: number, data: any) => null,
  removeAnimate: (time: number) => null,
  checkIfAnimate: (gameId: string) => false,
  createEvent:(event:AnimateEvent)=>null,
});

export const AnimateProvider = ({ children }: { children: React.ReactNode }) => {
  const animatesRef = useRef<Animate[]>([]);
  const [animateEvent, setAnimateEvent] = useState<AnimateEvent | null>(null);

  const createAnimate = useCallback(
    (animate: Animate) => {
      Object.assign(animate, { id: Date.now(), createTime: Date.now() });
      animatesRef.current.push(animate);
      setAnimateEvent({ name: animate.name, type: ANIMATE_EVENT_TYPE.CREATE });
    },
    [animatesRef]
  );
  const updateAnimate = useCallback((id: number, data: any) => {
    const animate = animatesRef.current.find((a) => a.id === id);
    if (animate) {
      Object.assign(animate, data);
      setAnimateEvent({ name: animate.name,  type: ANIMATE_EVENT_TYPE.UPDATE, data });
    }
  }, []);
  const removeAnimate = useCallback(
    (id: number) => {
      const animate = animatesRef.current.find((a) => a.id === id);
      if (!animate) return;
      const as = animatesRef.current.filter((a) => a.id !== id);
      animatesRef.current.length = 0;
      animatesRef.current.push(...as);
      setAnimateEvent({ name: animate.name, type: ANIMATE_EVENT_TYPE.REMOVE });
    },
    [animatesRef]
  );
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
  const createEvent = useCallback(
    (event:AnimateEvent) => {
      console.log(event)
      setAnimateEvent(event)
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
  const cvalue = useMemo(
    () => ({
      animates: animatesRef.current,
      createAnimate,
      updateAnimate,
      removeAnimate,
      checkIfAnimate,
      createEvent
    }),
    [animatesRef]
  );
  useBattleAnimateHandler(value);
  useGameAnimateHandler(value);
  return <AnimateContext.Provider value={cvalue}> {children} </AnimateContext.Provider>;
};

export const useAnimateManager = () => {
  return useContext(AnimateContext);
};

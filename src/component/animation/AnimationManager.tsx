import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CellItem } from "../../model/CellItem";
import { SCENE_NAME } from "../../model/Constants";
import { useGameManager } from "../../service/GameManager";
import { useSceneManager } from "../../service/SceneManager";
import useCollectCandies from "./CollectCandies";
import useChangeCandies from "./changeCandies";
import useMoveCandies from "./moveCandies";
import useRemoveCandies from "./removeCandies";
import playSwipeFail from "./swipeFail";
import playSwipeSuccess from "./swipeSuccess";
export interface AnimateElement {
  name: string;
  type: number; //0-HTMLDivElement 1-PIXI.Container 2-PIXI.Sprite
  ele: HTMLDivElement | PIXI.Container | PIXI.Sprite;
}
export interface Animate {
  name: string;
  timeline?: any;
  starttime: number;
  duration?: number;
  status?: number; //0-open 1-complete
  eles?: AnimateElement[];
}
interface IAnimateContext {
  animates: Animate[];
  animateEvent: AnimateEvent | null;
  createAnimate: (name: string, eles: AnimateElement[]) => void;
  updateAnimate: (name: string, eles: AnimateElement[]) => void;
  removeAnimate: (name: string) => void;
}
export interface AnimateEvent {
  name: string;
  time?: number;
  eles?: AnimateElement[];
}
const AnimateContext = createContext<IAnimateContext>({
  animates: [],
  animateEvent: null,
  createAnimate: (name: string, eles: AnimateElement[]) => null,
  updateAnimate: (name: string, eles: AnimateElement[]) => null,
  removeAnimate: (name: string) => null,
});

export const AnimateProvider = ({ children }: { children: React.ReactNode }) => {
  const animatesRef = useRef<Animate[]>([]);
  const [animateEvent, setAnimateEvent] = useState<AnimateEvent | null>(null);

  const value = {
    animates: animatesRef.current,
    animateEvent,
    createAnimate: useCallback((name: string, eles: AnimateElement[]) => {
      const animate = { name, starttime: Date.now(), eles };
      animatesRef.current.push(animate);
      setAnimateEvent(animate);
    }, []),
    updateAnimate: (name: string, eles: AnimateElement[]) => {
      const animate = animatesRef.current.find((a) => a.name === name);
      if (animate) {
        Object.assign(animate, { eles });
        setAnimateEvent(animate);
      }
    },
    removeAnimate: (name: string) => {
      const as = animatesRef.current.filter((a) => a.name !== name);
      animatesRef.current.length = 0;
      animatesRef.current.push(...as);
    },
  };
  return <AnimateContext.Provider value={value}> {children} </AnimateContext.Provider>;
};
export const useAnimates = () => {
  return useContext(AnimateContext);
};
export const useBattleAnimate = () => {
  const { animates, animateEvent, createAnimate, updateAnimate } = useAnimates();
  const { scenes, avatarTextures } = useSceneManager();
  console.log(animateEvent);

  const playBattleLoading = useCallback(
    (eles: AnimateElement[]) => {
      // const timeline = gsap.timeline({ repeat: -1, yoyo: true });
      // const animate: Animate = { name: ANIMATE_NAME.BATTLE_LOADING, timeline, starttime: Date.now(), eles };
      // // createAnimate(animate);
      // const searchEle = eles.find((e) => e.name === "search");
      // if (searchEle) {
      //   timeline.fromTo(
      //     searchEle.ele,
      //     { scaleX: 0.9, scaleY: 0.9 },
      //     { duration: 0.8, scaleX: 1.1, scaleY: 1.1, ease: "power2.inOut" }
      //   );
      //   timeline.play();
      // }
    },
    [createAnimate]
  );
  //   const playBattleMatching = useCallback(() => {
  //     const tl = gsap.timeline({
  //       ease: "power2.inOut",
  //       onComplete: () => {
  //         const animate = { name: ANIMATE_NAME.BATTLE_MATCHED, starttime: Date.now() };
  //         // createAnimate(animate);
  //       },
  //     });
  //     const loading = animates.find((a) => a.name === ANIMATE_NAME.BATTLE_LOADING);
  //     if (loading) {
  //       console.log("pause loading,element size:" + loading.eles?.length);
  //       loading.timeline.pause();
  //       const searchEle = loading.eles?.find((e) => e.name === "search");
  //       if (searchEle) {
  //         console.log("hide search");
  //         tl.to(searchEle.ele, { alpha: 0, duration: 0.1 });
  //       }
  //       const foundEle = loading.eles?.find((e) => e.name === "found");
  //       if (foundEle) {
  //         console.log("show found");
  //         tl.to(foundEle.ele, { alpha: 1, duration: 0.1 }, "<");
  //       }
  //       const versusEle = loading?.eles?.find((e) => e.name === "versus");
  //       if (versusEle) {
  //         console.log("show versus");
  //         tl.to(versusEle.ele, { alpha: 1, duration: 0.1 }, ">");
  //       }
  //     }
  //     const scene = scenes.get(SCENE_NAME.BATTLE_HOME);
  //     const a1texture = avatarTextures.find((a) => a.name === "A1");
  //     const a2texture = avatarTextures.find((a) => a.name === "A2");
  //     if (scene && a1texture && a2texture) {
  //       const w = scene.width;
  //       const h = scene.height;
  //       const avatar1 = new Avatar(a1texture.texture, "Kevin Qiao", 100, 140);
  //       const avatar2 = new Avatar(a2texture.texture, "Chris Li", 100, 140);
  //       avatar1.x = w / 2 - 100;
  //       avatar1.y = h / 2;
  //       avatar2.x = w / 2 + (100 - 80);
  //       avatar2.y = h / 2;
  //       const app = scene.app as PIXI.Application;
  //       app.stage.addChild(avatar1);
  //       app.stage.addChild(avatar2);
  //       tl.from(avatar1, { duration: 1, x: -100, y: h / 2 })
  //         .from(avatar2, { duration: 1, x: w + 100, y: h / 2 }, "<")
  //         .to([avatar1, avatar2], { duration: 0.1, alpha: 0 }, ">+=1");
  //       const searchDiv = loading?.eles?.find((e) => e.name === "scene");
  //       if (searchDiv) {
  //         tl.to(searchDiv.ele, { alpha: 0, duration: 0.1 }, "<");
  //       }
  //       tl.play();
  //     }
  //   }, [scenes, avatarTextures, createAnimate, animates]);
  //   return { animates, playBattleLoading, playBattleMatching };
};
const useAnimationManager = () => {
  const { textures, scenes } = useSceneManager();

  const { playCollect } = useCollectCandies();
  const { playRemove } = useRemoveCandies();
  const { playChange } = useChangeCandies();
  const { playMove } = useMoveCandies();
  const { cells } = useGameManager();
  console.log(Array.from(scenes.keys()));
  const startSwipe = async (
    gameId: string,
    candy: CellItem,
    target: CellItem
    // res: { toChange?: CellItem[]; toMove?: CellItem[]; toRemove?: CellItem[]; toCreate?: CellItem[] }
  ) => {
    const master = gsap.timeline();
    const scene = scenes.get(gameId);
    if (!scene || !scene.candies || !scene.cwidth) return;
    // [candy.row, target.row] = [target.row, candy.row];
    // [candy.column, target.column] = [target.column, candy.column];
    const sl = gsap.timeline();
    master.add(sl);
    playSwipeSuccess(candy, target, scene.candies, scene.cwidth, sl);
    const ml = gsap.timeline();
    master.add(ml, ">");
    // const { toChange, toRemove } = res;
    // if (scene?.candies && scene?.cwidth && toChange && toChange.length > 0) {
    //   playChange(toChange, textures, scene.candies, scene.cwidth, ml);
    // }
    // if (scene?.candies && toRemove && toRemove.length > 0) {
    //   playRemove(toRemove, scene.candies, ml);
    //   ml.call(
    //     () => {
    //       const cl = gsap.timeline();
    //       playCollect(gameId, toRemove, cl);
    //       cl.play();
    //     },
    //     [],
    //     ">"
    //   );
    // }
    master.play();
  };
  const cancelSwipe = async (gameId: string, candy: CellItem, target: CellItem) => {
    const scene = scenes.get(gameId);
    if (scene?.candies && scene?.cwidth && candy && target) playSwipeFail(candy, target, scene.candies, scene.cwidth);
  };

  const solveMatch = async (
    gameId: string,
    res: { toChange?: CellItem[]; toMove?: CellItem[]; toRemove?: CellItem[]; toCreate?: CellItem[] },
    timeline: any
  ) => {
    const scene = scenes.get(gameId);
    if (scene?.candies) console.log("candy sprite size:" + scene?.candies.size);
    const ml = gsap.timeline();
    timeline.add(ml, ">");
    const { toChange, toMove, toRemove } = res;
    if (scene?.candies && scene?.cwidth && toChange && toChange.length > 0) {
      playChange(toChange, textures, scene.candies, scene.cwidth, ml);
    }
    if (scene?.candies && toRemove && toRemove.length > 0) {
      playRemove(toRemove, scene.candies, ml);
      ml.call(
        () => {
          const cl = gsap.timeline();
          playCollect(gameId, toRemove, cl);
          cl.play();
        },
        [],
        ">-0.1"
      );
    }

    if (toMove && scene?.candies && scene.cwidth) {
      playMove(toMove, scene.candies, scene.cwidth, ml);
    }
  };

  const solveSwipe = (
    gameId: string,
    data: {
      candy: CellItem;
      target: CellItem;
      results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[];
    }
  ) => {
    const { candy, target, results } = data;
    const scene = scenes.get(gameId);

    const master = gsap.timeline({
      onComplete: () => {
        cells?.sort((a, b) => (a.row !== b.row ? a.row - b.row : a.column - b.column));
        console.log(JSON.parse(JSON.stringify(cells)));
      },
    });
    // const candy = scene?.candies?.get(data.candy.id)?.data;
    // const target = scene?.candies?.get(data.target.id)?.data;
    if (target && candy && scene?.candies && scene?.cwidth) {
      // Object.assign(candy, data.candy);
      // Object.assign(target, data.target);
      const sl = gsap.timeline();
      playSwipeSuccess(candy, target, scene.candies, scene.cwidth, sl);
      master.add(sl);
    }
    data.results.forEach((res) => {
      const ml = gsap.timeline();
      master.add(ml, ">");
      solveMatch(gameId, res, ml);
    });
    master.play();
  };

  const solveSmesh = (
    gameId: string,
    data: {
      candyId: number;
      results: { toChange: CellItem[]; toCreate: CellItem[]; toMove: CellItem[]; toRemove: CellItem[] }[];
    }
  ) => {
    const sl = gsap.timeline();
    data.results.forEach((res) => solveMatch(gameId, res, sl));
    sl.play();
  };
  const loadBattle = useCallback(() => {
    console.log("loading battle");
    const scene = scenes.get(SCENE_NAME.BATTLE_MATCHING);
    if (scene) {
      const tl = gsap.timeline();
      tl.to(scene.app, {
        duriation: 0.2,
        autoAlpha: 1,
      });
      tl.play();
    }
  }, [scenes]);

  return { solveSwipe, solveSmesh, startSwipe, cancelSwipe, loadBattle };
};
export default useAnimationManager;

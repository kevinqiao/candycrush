import { gsap } from "gsap";
import { createContext, lazy, useContext, useEffect, useRef, useState } from "react";
import useCoord from "service/CoordManager";
import { useUserManager } from "service/UserManager";

const slides = [
  { name: "tournamentHome", index: 0, uri: "./tournament/TournamentHome" },
  { name: "textureList", index: 1 },
  { name: "battleHome", index: 2, uri: "./battle/BattleHome" },
  { name: "accountHome", index: 3, uri: "./signin/AccountHome" },
  { name: "avatarList", index: 4 },
];
export interface INavContext {
  index: number;
  slideContainer: HTMLDivElement | null;
  components: { name: string; index: number; component: any; slide?: HTMLDivElement }[];
  loadMenu: (index: number, ele: SVGPolygonElement | null) => void;
  loadSlide: (index: number, ele: HTMLDivElement | null) => void;
  loadSlideContainer: (ele: HTMLDivElement | null) => void;
  changeIndex: (index: number) => void;
}

const NavContext = createContext<INavContext>({
  index: 2,
  slideContainer: null,
  components: [],
  loadMenu: (index: number, ele: SVGPolygonElement | null) => null,
  loadSlide: (index: number, ele: HTMLDivElement | null) => null,
  loadSlideContainer: (ele: HTMLDivElement | null) => null,
  changeIndex: (index: number) => null,
});

export const SlideNavProvider = ({ children }: { children: React.ReactNode }) => {
  const { width, height } = useCoord();
  const startXRef = useRef<number>(0);
  const menusRef = useRef<Map<number, SVGPolygonElement>>(new Map());
  const menuIndexRef = useRef<number>(2);
  const slideContainerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserManager();
  const [components, setComponents] = useState<
    { name: string; index: number; component: any; slide?: HTMLDivElement }[]
  >([]);

  const startMove = (event: TouchEvent | MouseEvent) => {
    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
    startXRef.current = clientX;
  };

  const endMove = (event: TouchEvent | MouseEvent) => {
    const clientX = "changedTouches" in event ? event.changedTouches[0].clientX : event.clientX;
    const diffX = startXRef.current - clientX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && menuIndexRef.current < 4) {
        changeIndex(menuIndexRef.current + 1);
      } else if (diffX < 0 && menuIndexRef.current > 0) {
        changeIndex(menuIndexRef.current - 1);
      }
    }
    startXRef.current = 0;
  };

  useEffect(() => {
    if (!user) return;
    const cs: { name: string; index: number; component: any }[] = [];
    for (let card of slides) {
      const c = card.uri ? lazy(() => import(`${card.uri}`)) : null;
      cs.push({ name: card.name, index: card.index, component: c });
    }
    setComponents(cs);
    return () => {
      if (slideContainerRef.current) {
        const swipeArea = slideContainerRef.current;
        swipeArea.removeEventListener("touchstart", startMove);
        swipeArea.removeEventListener("touchend", endMove);
      }
    };
  }, [user]);
  useEffect(() => {
    initContainer();
  }, [width, height]);

  const changeIndex = (index: number) => {
    const slideContainer = slideContainerRef.current;
    const premenu = menusRef.current.get(menuIndexRef.current);
    const curmenu = menusRef.current.get(index);
    const component = components.find((c) => c.index === index);
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(slideContainer, { duration: 1.4, alpha: 1, x: -index * width });
    if (component?.slide) {
      tl.to(component.slide, { autoAlpha: 1, duration: 1.4 }, "<");
    }
    if (premenu) tl.to(premenu, { fill: "grey", duration: 1 }, "<");
    if (curmenu) {
      tl.to(curmenu, { fill: "red", duration: 1 }, "<");
    }
    tl.play();
    menuIndexRef.current = index;
  };
  const initContainer = () => {
    const index = menuIndexRef.current;
    const curmenu = menusRef.current.get(index);
    const slideContainer = slideContainerRef.current;
    if (!slideContainer) return;
    const tl = gsap.timeline({
      onComplete: () => {
        tl.kill();
      },
    });
    tl.to(slideContainer, { duration: 0, x: -index * width }).to(slideContainer, { duration: 0.3, alpha: 1 });
    if (curmenu) tl.to(curmenu, { fill: "red", duration: 0.1 }, "<");
    tl.play();

    slideContainer.addEventListener("touchstart", startMove);
    slideContainer.addEventListener("touchend", endMove);
  };

  const loadMenu = (index: number, ele: SVGPolygonElement | null) => {
    if (ele) menusRef.current.set(index, ele);
  };
  const loadSlideContainer = (ele: HTMLDivElement | null) => {
    if (ele && !slideContainerRef.current) {
      slideContainerRef.current = ele;
      initContainer();
    }
  };
  const loadSlide = (index: number, ele: HTMLDivElement | null) => {
    const com = components.find((c) => c.index === index);
    if (com && ele) {
      com.slide = ele;
    }
  };
  const value = {
    index: menuIndexRef.current,
    slideContainer: slideContainerRef.current,
    components,
    loadMenu,
    loadSlideContainer,
    loadSlide,
    changeIndex,
  };
  return <NavContext.Provider value={value}> {children} </NavContext.Provider>;
};

export const useSlideNavManager = () => {
  return useContext(NavContext);
};

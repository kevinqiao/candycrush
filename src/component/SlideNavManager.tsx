import { gsap } from "gsap";
import PageProps from "model/PageProps";
import { createContext, lazy, useCallback, useContext, useEffect, useRef, useState } from "react";
import useCoord from "service/CoordManager";

export interface INavContext {
  index: number;
  pageProp: PageProps | null;
  slideContainer: HTMLDivElement | null;
  components: { name: string; index: number; component: any; slide?: HTMLDivElement }[];
  loadMenu: (index: number, ele: SVGPolygonElement | null) => void;
  loadSlide: (index: number, ele: HTMLDivElement | null) => void;
  loadSlideContainer: (ele: HTMLDivElement | null) => void;
  changeIndex: (index: number) => void;
}

const NavContext = createContext<INavContext>({
  index: 2,
  pageProp: null,
  slideContainer: null,
  components: [],
  loadMenu: (index: number, ele: SVGPolygonElement | null) => null,
  loadSlide: (index: number, ele: HTMLDivElement | null) => null,
  loadSlideContainer: (ele: HTMLDivElement | null) => null,
  changeIndex: (index: number) => null,
});

export const SlideNavProvider = ({
  pageEvent,
  pageProp,
  children,
}: {
  pageEvent: any;
  pageProp: PageProps;
  children: React.ReactNode;
}) => {
  const { width, height } = useCoord();
  const startXRef = useRef<number>(0);
  const menusRef = useRef<Map<number, SVGPolygonElement>>(new Map());
  const menuIndexRef = useRef<number>(2);
  const slideContainerRef = useRef<HTMLDivElement | null>(null);

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

  const changeIndex = useCallback(
    (index: number) => {
      if (index === menuIndexRef.current) return;
      const delta = Math.abs(menuIndexRef.current - index);
      const slideContainer = slideContainerRef.current;
      const premenu = menusRef.current.get(menuIndexRef.current);
      const curmenu = menusRef.current.get(index);
      // const component = components.find((c) => c.index === index);
      const tl = gsap.timeline({
        onComplete: () => {
          tl.kill();
        },
      });
      tl.to(slideContainer, { duration: delta * 0.3, alpha: 1, x: -index * width });
      // if (component?.slide) {
      //   tl.to(component.slide, { autoAlpha: 1, duration: 1.4 }, "<");
      // }
      if (premenu) tl.to(premenu, { fill: "grey", duration: 1 }, "<");
      if (curmenu) {
        tl.to(curmenu, { fill: "red", duration: 1 }, "<");
      }
      tl.play();
      menuIndexRef.current = index;
    },
    [components, width]
  );
  useEffect(() => {
    if (pageEvent && pageProp.config.children) {
      const index = pageProp.config.children.findIndex((c) => c.name === pageProp.child);
      changeIndex(index);
    }
  }, [changeIndex, pageEvent, pageProp]);
  useEffect(() => {
    if (pageProp.config?.children) {
      const cs: { name: string; index: number; component: any }[] = [];

      let index = 0;
      for (let child of pageProp.config.children) {
        // if (pageProp.child && pageProp.child === child.name) changeIndex(index);
        const c = child.uri ? lazy(() => import(`${child.path}`)) : null;
        cs.push({ name: child.name, index: index, component: c });
        index = index + 1;
      }
      setComponents(cs);
    }

    return () => {
      if (slideContainerRef.current) {
        const slideContainer = slideContainerRef.current;
        slideContainer.removeEventListener("touchstart", startMove);
        slideContainer.removeEventListener("touchend", endMove);
      }
    };
  }, [pageProp]);
  useEffect(() => {
    initContainer();
  }, [width, height]);

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
  };

  const loadMenu = (index: number, ele: SVGPolygonElement | null) => {
    if (ele) menusRef.current.set(index, ele);
  };
  const loadSlideContainer = (ele: HTMLDivElement | null) => {
    if (ele && !slideContainerRef.current) {
      if (pageProp.config.children) {
        if (pageProp.child) {
          const index = pageProp.config.children.findIndex((c: any) => c.name === pageProp.child);
          if (index >= 0) menuIndexRef.current = index;
        } else menuIndexRef.current = 2;
      }
      slideContainerRef.current = ele;
      ele.addEventListener("touchstart", startMove, { passive: true });
      ele.addEventListener("touchend", endMove, { passive: true });
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
    pageProp,
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


import { gsap } from "gsap";
import { createContext, lazy, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import useCoord from "service/CoordManager";
const slides = [
  { name: "tournamentHome", index: 0,uri:"./tournament/TournamentHome"},
  { name: "textureList", index: 1,uri:"./test/TextureList" },
  { name: "goalPanel", index: 2 ,uri:"./play/console/GoalPanel"},
  { name: "accountHome", index: 3 ,uri:"./signin/AccountHome"},
  { name: "avatarList", index: 4 ,uri:"./test/AvatarList"},
];
export interface INavContext {
  index:number;
  slideContainer:HTMLDivElement|null;
  components:{ name: string; index: number; component: any;slide?:HTMLDivElement}[];
  loadMenu:(index:number,ele:SVGPolygonElement|null)=>void;
  loadSlide:(index:number,ele:HTMLDivElement|null)=>void;
  loadSlideContainer:(ele:HTMLDivElement|null)=>void;
  changeIndex:(index:number)=>void;
}

const NavContext = createContext<INavContext>({
  index:2,
  slideContainer:null,
  components:[],
  loadMenu:(index:number,ele:SVGPolygonElement|null)=>null,
  loadSlide:(index:number,ele:HTMLDivElement|null)=>null,
  loadSlideContainer:(ele:HTMLDivElement|null)=>null,
  changeIndex:(index:number)=>null
});

export const NavAnimateProvider = ({ children }: { children: React.ReactNode }) => { 
  const { width, height } = useCoord();
  const menusRef = useRef<Map<number,SVGPolygonElement>>(new Map())
  const menuIndexRef = useRef<number>(2);
  const slideContainerRef = useRef<HTMLDivElement | null>(null);
  const [components, setComponents] = useState<{ name: string; index: number; component: any;slide?:HTMLDivElement}[]>([]);
  useEffect(() => {
    const cs: { name: string; index: number; component: any }[] = [];
    for (let card of slides) {    
        const c = lazy(() => import(`${card.uri}`));
        cs.push({ name: card.name, index: card.index, component:c});
    }
    setComponents(cs)
  }, []);

  const changeIndex=(index:number)=>{
    console.log("changeIndex:"+index)
    const slideContainer= slideContainerRef.current;
    const premenu = menusRef.current.get(menuIndexRef.current);
    const curmenu = menusRef.current.get(index);
    const component = components.find((c)=>c.index===index)
    const tl = gsap.timeline({onComplete:()=>{
      tl.kill()
    }})
    tl.to(slideContainer, { duration: 1.4, alpha: 1, x: -index * width });
    if(component?.slide){
      tl.to(component.slide,{autoAlpha:1,duration:1.4},"<")
    }
    if(premenu)
        tl.to(premenu, { fill: "grey", duration: 1 },"<")
    if(curmenu){
      tl.to(curmenu,{fill:"red",duration:1},"<")
    }
    tl.play()
    menuIndexRef.current= index;
 }
 const initSlides=()=>{
  const index = menuIndexRef.current;
  const slideContainer= slideContainerRef.current;
  const tl = gsap.timeline({onComplete:()=>{
    tl.kill()
  }})
  tl.to(slideContainer, { duration: 0.1,  x: -index * width }).to(slideContainer,{duration: 0.4, alpha: 1})
  tl.play()
 }

 const loadMenu=(index:number,ele:SVGPolygonElement|null)=>{
  if(ele)
    menusRef.current.set(index,ele)
  }
  const loadSlideContainer=(ele:HTMLDivElement|null)=>{
      if(ele){
         slideContainerRef.current = ele;
         initSlides();
      }
  }
  const loadSlide=(index:number,ele:HTMLDivElement|null)=>{

    const  com = components.find((c)=>c.index===index);
    if(com&&ele){
       com.slide=ele
       console.log("slide index:"+index+" loaded")
    }
 }
  const value={
      index:menuIndexRef.current,
      slideContainer:slideContainerRef.current,
      components,
      loadMenu,
      loadSlideContainer,
      loadSlide,
      changeIndex
  }
  return <NavContext.Provider value={value}> {children} </NavContext.Provider>;
};

export const useNavAnimateManager = () => {
  return useContext(NavContext);
};

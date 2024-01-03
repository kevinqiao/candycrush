import { gsap } from "gsap";
import { useCallback, useEffect } from "react";
import { useBattleManager } from "service/BattleManager";
import { SCENE_NAME } from "../../model/Constants";
import { useSceneManager } from "../../service/SceneManager";
import { ANIMATE_EVENT_TYPE, ANIMATE_NAME } from "./AnimateConstants";
import { IAnimateHandleContext } from "./AnimateManager";
import useBattleBoard from "./battle/BattleBoard";
import useBattleMatching from "./battle/BattleMatching";
import useBattleSearching from "./battle/BattleSearching";
import useGameReady from "./game/GameReady";
import * as gameEngine from "../../service/GameEngine";

export const useBattleAnimateHandler = (props: IAnimateHandleContext) => {
    const { animates, animateEvent, removeAnimate } = props;
    const { startSearching } = useBattleSearching(props);
    const { startBattleMatching } = useBattleMatching(props)
    const {battle} = useBattleManager();
    const { scenes } = useSceneManager();
    const {initGame} = useGameReady();
    const {initConsole} = useBattleBoard();
    const processBattleInit = useCallback(() => {
     
        if(!battle) return;
        const timeline = gsap.timeline({
            onComplete: () => {
                timeline.kill();
            }
        });
      
        battle.games.forEach((g)=>{
            const gl = gsap.timeline();
            timeline.add(gl,"<");
            initGame(g.gameId, gl);
             const score = gameEngine.countBaseScore(g.matched)
             const sl = gsap.timeline();
             timeline.add(sl,"<")
            initConsole(g.uid,g.gameId,score,sl);           
        })
        timeline.play();
    }, [battle])   

    useEffect(() => {
        console.log(animateEvent)
        if (animateEvent?.name&& animateEvent.type === ANIMATE_EVENT_TYPE.CREATE) {
                switch (animateEvent.name) {
                    case ANIMATE_NAME.BATTLE_INITED:
                        processBattleInit();
                        break;
                    default:
                        break;
                }            
        }
    }, [animateEvent])

}
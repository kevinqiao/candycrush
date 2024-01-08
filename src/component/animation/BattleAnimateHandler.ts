import { gsap } from "gsap";
import { useCallback, useEffect } from "react";
import { useBattleManager } from "service/BattleManager";
import * as gameEngine from "../../service/GameEngine";
import { ANIMATE_EVENT_TYPE, ANIMATE_NAME } from "./AnimateConstants";
import { IAnimateHandleContext } from "./AnimateManager";
import useBattleBoard from "./battle/BattleBoard";
import useGameReady from "./game/GameReady";

export const useBattleAnimateHandler = (props: IAnimateHandleContext) => {
    const { animateEvent } = props;
    const { battle } = useBattleManager();
    const { initGame } = useGameReady();
    const { initConsole } = useBattleBoard();
    const processBattleInit = useCallback(() => {

        if (!battle) return;
        const timeline = gsap.timeline({
            onComplete: () => {
                timeline.kill();
            }
        });
        battle.games.forEach((g) => {
            const gl = gsap.timeline();
            timeline.add(gl, "<");
            initGame(g.gameId, gl);
            const score = gameEngine.countBaseScore(g.matched)
            const sl = gsap.timeline();
            timeline.add(sl, "<")
            initConsole(g.uid, g.gameId, score, sl);
        })
        timeline.play();
    }, [battle])

    useEffect(() => {

        if (animateEvent?.name && animateEvent.type === ANIMATE_EVENT_TYPE.CREATE) {
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
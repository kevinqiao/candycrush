import { gsap } from "gsap";
import { BattleModel } from "model/Battle";
import { useCallback } from "react";
import { useUserManager } from "service/UserManager";
import * as GameUtils from "../../../util/MatchGameUtils";
import useCandyMatch from "../game/useCandyMatch";
import useInitGame from "../game/useInitGame";
import useSwipeCandy from "../game/useSwipeCandy";
import useInitConsole from "./useInitConsole";


export const useAnimation = () => {
    const { user } = useUserManager();
    const initGame = useInitGame();
    const initConsole = useInitConsole();
    const { swipeSuccess: playSwipeSuccess, swipeFail: playSwipeFail } = useSwipeCandy();
    const { play: playCandyMatch } = useCandyMatch();

    const playInitBattle = useCallback((battle: BattleModel, timeline: any) => {

        if (!battle?.games) return;
        const bl = timeline ?? gsap.timeline({
            onComplete: () => {
                bl.kill();
            }
        });
        // const bl = gsap.timeline();
        // tl.add(bl, ">+=1.0")
        battle.games.forEach((g) => {
            const gl = gsap.timeline();
            bl.add(gl, "<");
            initGame.play(g.gameId, gl);
            const score = GameUtils.countBaseScore(g.data.matched)
            const sl = gsap.timeline();
            bl.add(sl, "<");
            const isPlayer = user.uid === g.uid ? true : false
            console.log(g.gameId + ":" + isPlayer)
            initConsole.play(isPlayer, g.gameId, score, sl);
        })
        if (!timeline)
            bl.play();
    }, [])

    return { playInitBattle, playSwipeFail, playSwipeSuccess, playCandyMatch }
}
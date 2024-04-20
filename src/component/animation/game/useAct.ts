import { CandySprite } from "component/pixi/CandySprite";
import { CellItem } from "model/CellItem";
import { useCallback } from "react";
import { useBattleManager } from "service/BattleManager";
import { useGameManager } from "service/GameManager";
import { hasMatch3 } from "util/MatchGameUtils";
import * as Constant from "../../../model/Constants";
import { useSceneManager } from "../../../service/SceneManager";
import useSwipe from "./useSwipe";


const useAct = () => {
    const { battle } = useBattleManager();
    const { scenes } = useSceneManager();
    const { game, doAct } = useGameManager();
    const { swipeSuccess, swipeFail } = useSwipe();

    const swipeAct = useCallback(

        (candy: CellItem, target: CellItem) => {
            if (!battle || !game) return;
            const { row, column } = battle.data
            const scandy = { ...candy };
            const starget = { ...target };
            [scandy.row, starget.row] = [starget.row, scandy.row];
            [scandy.column, starget.column] = [starget.column, scandy.column];
            const smeshIds = [28, 29, 30, 31];
            const grid: CellItem[][] = Array.from({ length: row }, () => Array(column).fill(null));
            game.data.cells.sort((a: CellItem, b: CellItem) => a.row === b.row ? a.column - b.column : a.row - b.row);
            for (const unit of game.data.cells) {
                let sunit = { ...unit };
                if (unit.id === scandy.id) {
                    sunit = scandy;
                } else if (unit.id === starget.id) {
                    sunit = starget;
                }
                grid[sunit.row][sunit.column] = sunit
            }
            if (hasMatch3(grid) || smeshIds.includes(candy['asset']) || smeshIds.includes(target['asset'])) {
                swipeSuccess(game.gameId, scandy, starget, null)
                doAct(Constant.GAME_ACTION.SWIPE_CANDY, { candyId: candy.id, targetId: target.id })
            } else {
                swipeFail(game.gameId, candy.id, target.id, null);
            }
        },
        [battle, game, doAct]
    );
    const hitAct = useCallback(

        (candy: CandySprite) => {
            const smeshIds = [28, 29, 30, 31];
            if (smeshIds.includes(candy.asset))
                doAct(Constant.GAME_ACTION.SMASH_CANDY, { candyId: candy.id })
        },
        [doAct]
    );

    return { swipeAct, hitAct };
};
export default useAct
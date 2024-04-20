import { CandySprite } from "component/pixi/CandySprite";
import * as PIXI from "pixi.js";
import { useCallback, useRef } from "react";
import { useGameManager } from "service/GameManager";
import * as Constant from "../../../model/Constants";
import { GameScene } from "../../../model/SceneModel";
import { useSceneManager } from "../../../service/SceneManager";

const useSkill = () => {
    const focusIconRef = useRef<PIXI.Sprite | null>(null)
    const { iconTextures, scenes } = useSceneManager();
    const { game, doAct } = useGameManager();

    const swapSelect = useCallback(

        (candy: CandySprite) => {
            if (!game) return;
            const gameScene = scenes.get(game.gameId) as GameScene;
            const stage = (gameScene.app as PIXI.Application).stage;
            const texture = iconTextures[0]['texture']
            const focusIcon = new PIXI.Sprite(texture);
            focusIcon.anchor.set(0.5);
            focusIcon.tint = 0xff0000;
            focusIcon.width = gameScene.cwidth;
            focusIcon.height = gameScene.cwidth;
            focusIcon.x = candy.x;
            focusIcon.y = candy.y;
            stage.addChild(focusIcon);
            focusIconRef.current = focusIcon
        },
        [game]
    );
    const resetSkill = useCallback(

        () => {
            if (focusIconRef.current) {
                focusIconRef.current.destroy();
                focusIconRef.current = null;
            }
        },
        []
    );

    const executeSkill = useCallback(
        (skill: number, data: any) => {
            console.log("execute skill:" + skill)
            switch (skill) {
                case 1:
                    console.log(data)
                    doAct(Constant.GAME_ACTION.SKILL_HAMMER, data)
                    break;
                case 2:
                    doAct(Constant.GAME_ACTION.SKILL_SWAP, data)
                    break;
                case 3:
                    doAct(Constant.GAME_ACTION.SKILL_SPRAY, data)
                    break;
                default:
                    break;
            }
        },
        [doAct]
    );

    return { swapSelect, resetSkill, executeSkill };
};
export default useSkill
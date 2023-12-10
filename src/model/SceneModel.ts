import * as PIXI from "pixi.js";
import { CandySprite } from "../component/pixi/CandySprite";
export interface SceneModel {
    container?: HTMLDivElement;
    app: PIXI.Application | HTMLDivElement;
    type?: number;//0-PIXI.Application 1-HTMLDIVELEMENT
    x: number;
    y: number;
    width: number;
    height: number;
    // cwidth?: number;
    // cheight?: number;
    // column?: number;
    // row?: number;
    // textures?: { id: number; texture: PIXI.Texture }[];
    // candies?: Map<number, CandyModel>;
    // candies?: Map<number, CandySprite>;
}
export interface GameScene extends SceneModel {
    cwidth: number;
    cheight: number;
    column: number;
    row: number;
    candies: Map<number, CandySprite>;
}

export interface SearchScene extends SceneModel {
    sceneEle: HTMLDivElement;
    searchTxTEle: HTMLDivElement;
    vsEle: HTMLDivElement;
    foundTxTEle: HTMLDivElement;
    playerAvatarEle: HTMLDivElement;
    opponentAvatarEle: HTMLDivElement;
}
export interface ConsoleScene extends SceneModel {
    avatarBars: { gameId: string; avatar: HTMLElement | null; bar: HTMLElement | null; score: HTMLElement | null }[];
    goalPanels: { gameId: string; goals: { asset: number; iconEle: HTMLElement | null; qtyEle: HTMLElement | null }[] }[]
}
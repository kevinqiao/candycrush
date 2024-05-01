import * as PIXI from "pixi.js";
import { CandySprite } from "../component/pixi/CandySprite";
export interface SceneModel {
    // container?: HTMLDivElement;
    app: PIXI.Application | HTMLDivElement | null;
    type?: number;//0-PIXI.Application 1-HTMLDIVELEMENT
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface GameScene extends SceneModel {
    gameId: string;
    cwidth: number;
    cheight: number;
    column: number;
    row: number;
    candies: Map<number, CandySprite>;
    mode?: number;//
}

export interface SearchScene {
    containerEle: HTMLDivElement;
    searchEle: HTMLDivElement;
}
export interface ConsoleScene extends SceneModel {
    avatarBars: { gameId: string; avatar: HTMLElement | null; bar: HTMLElement | null; score: HTMLElement | null; plus: HTMLElement | null }[];
    goalPanels: { gameId: string; goals: { asset: number; iconEle: HTMLElement | null; qtyEle: HTMLElement | null }[] }[]
}
export interface GameConsoleScene extends SceneModel {
    gameId: string;
    avatarBar?: { avatar: HTMLElement | null; bar: HTMLElement | null; score: HTMLElement | null; plus: HTMLElement | null };
    goalPanel?: { goals: { asset: number; iconEle: HTMLElement | null; qtyEle: HTMLElement | null }[] };
    mode?: number;
}
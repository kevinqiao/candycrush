import * as PIXI from "pixi.js";
import { CellItem } from "./CellItem";
export interface CandyModel {
    id: number;
    sprite: PIXI.Sprite;
    data: CellItem;

}
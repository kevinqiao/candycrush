import * as PIXI from 'pixi.js';

export class CandySprite extends PIXI.Sprite {
    id: number;
    column: number;
    row: number;
    constructor(texture: PIXI.Texture, id: number, column: number, row: number) {
        super(texture);
        this.id = id;
        this.column = column;
        this.row = row;
    }

}

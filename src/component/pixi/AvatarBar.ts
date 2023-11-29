import * as PIXI from 'pixi.js';
export const ARRAY_TYPE = {
    HORIZATION_LEFT: 1,
    HORIZATION_RIGHT: 2,
    VERTICAL_TOP: 3,
    VERTICAL_BOTTOM: 4
}
export class AvatarBar extends PIXI.Container {
    name: string;
    private avatar: PIXI.Sprite;
    private text: PIXI.Text;
    private bar: PIXI.Graphics;
    constructor(avatarTexture: PIXI.Texture, name: string, width: number, height: number, arrayType: number) {
        super();
        this.name = name;
        this.width = width;
        this.height = height;

        const radius = Math.floor(height / 2);
        this.bar = new PIXI.Graphics();
        const barX = arrayType === ARRAY_TYPE.HORIZATION_LEFT ? radius : 0;
        const barY = radius * 0.2;
        const bwidth = width - radius;
        this.bar.beginFill(0x00ff00, 1); // 0x000000 为黑色，0.5 为透明度
        this.bar.drawRoundedRect(barX, barY, bwidth, height * 0.8, 5);
        this.bar.endFill();
        this.addChild(this.bar);

        this.avatar = new PIXI.Sprite(avatarTexture);
        this.avatar.anchor.set(0.5);
        this.avatar.width = height * 1.2;
        this.avatar.height = height * 1.2;
        this.avatar.x = arrayType === ARRAY_TYPE.HORIZATION_LEFT ? radius : width - height / 2;
        this.avatar.y = Math.floor(height / 2);
        this.addChild(this.avatar);

        const textStyle = new PIXI.TextStyle({
            fontSize: 10,
            fill: 0xffffff,
            fontWeight: 'bold',
            align: "center"
        });

        this.text = new PIXI.Text(name, textStyle);
        this.text.anchor.set(0.5)
        // Position the text (optional)
        this.text.x = arrayType === ARRAY_TYPE.HORIZATION_LEFT ? width - 10 - this.text.width / 2 : 10 + this.text.width / 2;
        this.text.y = height / 2;
        this.addChild(this.text)

    }

    changeTxTStyle = (style: any) => {
        this.text.style = new PIXI.TextStyle(style)
    }

}

import * as PIXI from "pixi.js";
import seedrandom from 'seedrandom';
export const getNthRandom = (seed: string, n: number): number => {
    const rng = seedrandom(seed);
    let value = 0;

    for (let i = 0; i < n; i++) {
        value = rng();
    }

    return value;
}
export const getRandomSeed = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
export const getRandom = (max: number) => {
    return Math.floor(Math.random() * max);
}
export const loadSvgAsTexture = (url: string, callback: (texture: PIXI.Texture) => void) => {
    const image = new Image();
    image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D context');
        }

        context.drawImage(image, 0, 0);
        const texture = PIXI.Texture.from(canvas);
        callback(texture);
    };
    image.onerror = () => {
        throw new Error('Failed to load image at ' + url);
    };
    image.src = url;
}
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
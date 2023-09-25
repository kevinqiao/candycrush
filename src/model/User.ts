export interface User {
    uid: string;
    name: string;
    channel: number;
    email?: string;
    level: number;
    exp: number;
    status?: number;//0-active 1-removed
}
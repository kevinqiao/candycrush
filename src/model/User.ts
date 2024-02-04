// export interface User {


//     uid: string;
//     token: string;
//     name: string;
//     email?: string;
//     level?: number;
//     exp?: number;
//     status?: number;//0-active 1-removed
// }
export interface User {
    uid: string;
    token: string;
    tenant?: number;
    name?: string;
    battle?: any;
    timelag: number;
    timestamp?: number;
    authEmbed?: number;//type:0-in browser >1-in app (1-telegram bot 2-FB bot)
}
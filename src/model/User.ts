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
    name?: string;
    battle?: any;
    timelag: number;
    timestamp?: number;
}
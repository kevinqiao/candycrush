import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "settle match",
    { seconds: 2 }, // every minute
    internal.matchqueue.settleMatch,
);
// crons.interval(
//     "settle battle",
//     { seconds: 10 }, // every minute
//     internal.battle.settleBattle,
// );

//  
export default crons
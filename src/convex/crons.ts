import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
//     "auto game",
//     { seconds: 100 }, // every minute
//     // internal.games.autoStep,
// );
// crons.interval(
//     "settle battle",
//     { seconds: 10 }, // every minute
//     internal.battle.settleBattle,
// );

crons.interval(
    "settle match opponent",
    { seconds: 1 }, // every minute
    internal.matchqueue.settleMatch,
);
export default crons
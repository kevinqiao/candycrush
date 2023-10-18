import { cronJobs } from "convex/server";

const crons = cronJobs();

// crons.interval(
//     "clear messages table",
//     { seconds: 1 }, // every minute
//     internal.AutoGameService.startAuto
// );
export default crons
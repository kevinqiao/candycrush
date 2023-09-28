import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "clear messages table",
    { seconds: 100 }, // every minute
    internal.events.hi
);
export default crons
import { v } from "convex/values";
import { report } from "process";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, query } from "./_generated/server";

interface Tournament {
  id: string;
  type?: number;//0-unlimit 1-schedule
  participants: number;
  battleTime: number;  
  currentTerm?:number;
  schedule?:{startDay:number;duration:number};
  goals?:number[],
  cost?:{asset:number;amount:number}[],
  rewards?: {rank:number;assets:{asset:number;amount:number}[];points:number}[],
  status: number,//0-on going 1-over 2-settled
}
interface BattleModel {
  type?: number;//0-solo 1-sync 2-turn 3-replay
  column: number;
  row: number;
  tournamentId: string;
  report?:{uid:string;gameId:string;score:number}[];
  rewards?:BattleReward[];
  status?: number;//0-active 1-over 2-settled
  goal?: number;
}
export type BattleReward={
  uid:string;
  gameId:string;
  rank:number;
  score:number;
  points?:number;
  assets?:{asset:number,amount:number}[]
}

const countRewards=(tournament:Tournament,battle:BattleModel):BattleReward[]=>{
    const rewards:BattleReward[] =[];
    if(battle.report&&battle.report.length>0){
        battle.report.sort((a,b)=>b.score-a.score).forEach((r,index)=>{
            const reward =tournament.rewards?.find((w)=>w.rank===index);
            if(reward){
              rewards.push({uid:r.uid,gameId:r.gameId,rank:index,score:r.score,points:reward.points,assets:reward.assets})
            }
        })         
    }

    return rewards;
}
export const create = internalMutation({
  args: { tournamentId: v.string(), participants: v.number(),startTime:v.number(), column: v.number(), row: v.number(), goal: v.optional(v.number()), chunk: v.optional(v.number()) },
  handler: async (ctx, { tournamentId, participants,startTime, column, row, goal, chunk }) => {
    return await ctx.db.insert("battle", {startTime, tournamentId, participants, row, column, goal, chunk });
  },
});

export const find = internalQuery({
  args: { battleId: v.id("battle") },
  handler: async (ctx, { battleId }) => {
    const battle = await ctx.db.get(battleId);
    if (battle)
      return Object.assign({}, battle, { id: battle._id, _id: undefined, createTime: battle._creationTime, _creationTime: undefined });
    return null;
  },
});
export const settleGame = internalMutation({
  args: { battleId: v.id("battle"), uid: v.string(), gameId: v.string(), score: v.number() },
  handler: async (ctx, { battleId, gameId, uid, score }) => {
    const battle = await ctx.db.get(battleId);
    if (battle) {
      if (!battle.report)
        battle.report = [];
      battle.report.push({ uid, gameId, score });
      if (battle.participants === battle.report.length){
        // const tournament = await ctx.db.get(battle.tournamentId as Id<"tournament">);
        const tournament =await ctx.db.query("tournament").filter((q) => q.eq(q.field("id"), battle.tournamentId)).order("asc").first();
        if(tournament){
           const rewards = countRewards(tournament,battle);           
           for(let r of rewards){
              if(r.assets){
                for(const a of r.assets){
                  const asset = await ctx.db.query("asset")
                  .filter((q) =>q.and(q.eq(q.field("type"),a.asset), q.eq(q.field("uid"), r.uid))).first();
                  if(asset){
                     asset.amount =asset.amount+a.amount;         
                     await ctx.db.patch(asset._id, { amount:asset.amount});            
                  }else{
                    await ctx.db.insert("asset", {  uid, type:a.asset, amount:a.amount,  lastUpdate: Date.now() });
                  }
                }
              }
              if(r.points){
                const boardItem = await ctx.db.query("leaderboard")
                .filter((q) =>q.and(q.eq(q.field("tournamentId"),tournament.id), q.eq(q.field("term"), tournament.currentTerm), q.eq(q.field("uid"), r.uid))).first();
                if(boardItem){
                   await ctx.db.patch(boardItem._id, { points:boardItem.points+r.points});    
                }else{
                   const term = tournament.currentTerm??0;
                   await ctx.db.insert("leaderboard",{uid:r.uid,tournamentId:tournament.id,term,points:r.points,lastUpdate:Date.now()})
                }
              }
           }
           battle.rewards = rewards
           battle.status = 1;
        }
      
      }
      await ctx.db.patch(battle._id, { status: battle.status, report: battle.report,rewards:battle.rewards })
    }
    return battle;
  }
});

export const findMyBattles = query({
  args: { uid: v.string(),lastTime:v.number()},
  handler: async (ctx, { uid,lastTime}) => {
    const mybattles = [];
    let time=lastTime;
    const games = await ctx.db.query("games").filter((q) => q.and(q.eq(q.field("uid"),uid),q.lt(q.field("_creationTime"),lastTime))).order("desc").collect();
    for(const game of games){
        const b:any= await ctx.db.get(game.battleId as Id<"battle">);
        if(b)
           mybattles.push({...b,id:b._id,_id:undefined,time:b._creationTime,_creationTime:undefined})
        time = game._creationTime;
    }  
    return {battles:mybattles,time} 
  },
});
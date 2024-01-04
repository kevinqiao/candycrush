export interface Tournament {
    id: string;
    type: number;//0-unlimit 1-schedule
    participants: number;
    battleTime: number;  
    currentTerm:number;
    schedule:{startDay:number;duration:number};
    goals:number[],
    cost:{asset:number;quantity:number}[],
    rewards: {rank:number;assets:{asset:number;quantity:number};points:number}[],
    status: number,//0-on going 1-over 2-settled
}
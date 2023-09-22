export interface Tournament {
    id: string;
    type: number;
    startTime?: number;
    endTime?: number;
    status?: number;//0-inactive 1-active 2-settled 3-cancelled 
    defs?: any;
}
import BattleModel from "../../model/Battle";
import { usePageManager } from "../../service/PageManager";
import "./battle.css";
type BattleReward={
  uid:string;
  gameId:string;
  rank:number;
  points?:number;
  assets?:{asset:number,amount:number}[]
}
export interface Battle{
  id:string;
  type: number;
  participants: number;
  tournamentId: string;
  term:number;
  report: {uid:string;gameId:string;score:number}[];
  rewards:BattleReward[];  
  status: number;//0-going 1-settled 2-cancelled
}
interface Props {
  battle: Battle;
}
const BattleItem: React.FC<Props> = ({ battle }) => {
  const { openPage } = usePageManager();

  return (
    <div className="battle-item">
     
      {battle?.report?.map((g) => (
        <div key={g.uid} style={{display:"flex",justifyContent:"space-between"}}>
          <div><span style={{ fontSize: "20px", color: "black" }}>Player:({g.uid})</span></div>
          <div
            key={g.gameId}
            className="play-btn"          
          >
            RePlay
          </div>
          <div>Result:{g.score}</div>      
          
        </div>
      ))}
    </div>
  );
};

export default BattleItem;

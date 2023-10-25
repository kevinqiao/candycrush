import { useGameManager } from "../../../service/GameManager";

const ReplayConsole: React.FC = () => {
  const { matched } = useGameManager();
  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "white" }}>
      {matched.map((m: { asset: number; quantity: number }) => (
        <div key={m.asset}>
          <span>{m.asset}</span>:<span>{m.quantity}</span>
        </div>
      ))}
    </div>
  );
};

export default ReplayConsole;

import { useGameManager } from "../../service/GameManager";

const SoloConsole: React.FC = () => {
  const { matched } = useGameManager();
  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "white" }}>
      {matched.map((m: { asset: number; quantity: number }) => (
        <div>
          <span>{m.asset}</span>:<span>{m.quantity}</span>
        </div>
      ))}
    </div>
  );
};

export default SoloConsole;

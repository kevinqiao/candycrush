import { usePageManager } from "../../service/PageManager";
const Market: React.FC = () => {
  const { openPage } = usePageManager();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        backgroundColor: "red",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div
        className="signin-btn"
        onClick={(e) => {
          openPage({ name: "signin", data: {} });
        }}
      >
        Market
      </div>
    </div>
  );
};

export default Market;

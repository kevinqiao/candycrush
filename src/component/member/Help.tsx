import { usePageManager } from "../../service/PageManager";

const Help: React.FC = () => {
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
        Help
      </div>
    </div>
  );
};

export default Help;

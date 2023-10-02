import useCoord from "../../service/CoordManager";
import { usePageManager } from "../../service/PageManager";
import "./signin.css";
const AccountHome: React.FC = () => {
  const { width, height } = useCoord();
  const { openPage } = usePageManager();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: height,
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
        SignIn
      </div>
    </div>
  );
};

export default AccountHome;

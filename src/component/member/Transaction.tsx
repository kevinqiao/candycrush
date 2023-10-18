import { usePageManager } from "../../service/PageManager";
import { useUserManager } from "../../service/UserManager";

const Transaction: React.FC = () => {
  const { user, signout } = useUserManager();
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
        Transaction List
      </div>
    </div>
  );
};

export default Transaction;

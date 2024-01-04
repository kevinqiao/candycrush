import { usePageManager } from "../../service/PageManager";
import { useUserManager } from "../../service/UserManager";
import "./signin.css";
const AccountHome: React.FC = () => {
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
      {user ? <div>{user.name}</div> : null}
      {user ? (
        <div
          className="signin-btn"
          onClick={(e) => {
            signout();
            // openPage({ name: "signin", data: {} });
          }}
        >
          Signout
        </div>
      ) : (
        <div
          className="signin-btn"
          onClick={(e) => {
            openPage({ name: "signin", data: {} });
          }}
        >
          SignIn
        </div>
      )}
    </div>
  );
};

export default AccountHome;

import PageProps from "../../model/PageProps";
import useUserAuth from "../auth/provider/UserAuth";

const SignIn: React.FC<PageProps> = ({ data, position }) => {
  const { login } = useUserAuth();
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: position?.width,
          height: position?.height,
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 120,
            height: 50,
            backgroundColor: "blue",
            color: "white",
          }}
          onClick={() => login("kqiao", "kevin qiao")}
        >
          SignIn
        </div>
      </div>
    </>
  );
};

export default SignIn;

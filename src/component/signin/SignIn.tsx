import PageProps from "../../model/PageProps";
import { useUserManager } from "../../service/UserManager";

const SignIn: React.FC<PageProps> = ({ data, position }) => {
  const { signin } = useUserManager();
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
          onClick={() => signin("kqiao", "12345")}
        >
          SignIn
        </div>
      </div>
    </>
  );
};

export default SignIn;

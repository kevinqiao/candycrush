import { useEffect, useState } from "react";
import PageProps from "../../model/PageProps";
import useUserAuth from "../auth/provider/UserAuth";

const SignIn: React.FC<PageProps> = (props) => {
  const [users, setUsers] = useState<any[]>();
  const { login, findAllUser } = useUserAuth();
  useEffect(() => {
    findAllUser().then((us) => {
      console.log(us);
      setUsers(us);
    });
  }, []);
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "white",
        }}
      >
        {users?.map((user) => (
          <div
            key={user.uid}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 120,
              height: 50,
              backgroundColor: "blue",
              color: "white",
            }}
            onClick={() => login(user.uid, user.name)}
          >
            {user["name"]}
          </div>
        ))}
        {/* <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 120,
            height: 50,
            backgroundColor: "blue",
            color: "white",
          }}
          onClick={() => login("kqiao2", "kevin qiao")}
        >
          SignIn(kqiao2)
        </div> */}
      </div>
    </>
  );
};

export default SignIn;

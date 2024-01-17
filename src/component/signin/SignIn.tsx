import { useEffect, useState } from "react";
import { useUserManager } from "service/UserManager";
import PageProps from "../../model/PageProps";

const SignIn: React.FC<PageProps> = ({ close }) => {
  const [users, setUsers] = useState<any[]>();
  const { user, signin, findAllUser } = useUserManager();
  useEffect(() => {
    findAllUser().then((us: any) => {
      setUsers(us);
    });
  }, []);
  useEffect(() => {
    if (user && close) close(0);
  }, [user, close]);
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
            onClick={() => signin(user.uid, user.name)}
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

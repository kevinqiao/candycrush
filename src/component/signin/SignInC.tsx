import { useMatch3AuthManager } from "component/auth/provider/Match3Auth";
import React, { useEffect, useState } from "react";
import { useUserManager } from "service/UserManager";
import PageProps from "../../model/PageProps";

const SignInC: React.FC<PageProps> = ({ close }) => {
  const [users, setUsers] = useState<any[]>();
  const { authComplete } = useUserManager();
  const { signin, allUser } = useMatch3AuthManager();
  useEffect(() => {
    allUser().then((us: any) => {
      setUsers(us);
    });
  }, []);

  const login = async (uid: string, token: string) => {
    const u = await signin(uid, token);
    if (u) {
      if (close) close(0);
      authComplete(u);
    }
  };
  return (
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
      {users?.map((u) => (
        <div
          key={u.uid}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 120,
            height: 50,
            backgroundColor: "blue",
            color: "white",
          }}
          onClick={() => login(u.uid, u.name)}
        >
          {u["name"]}
        </div>
      ))}
    </div>
  );
};

export default SignInC;

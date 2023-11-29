import { useAction } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { usePageManager } from "../../service/PageManager";
import { useUserManager } from "../../service/UserManager";

const AuthCheck: React.FC = () => {
  const { authComplete } = useUserManager();
  const { openPage } = usePageManager();
  const authByToken = useAction(api.UserService.authByToken);

  useEffect(() => {
    const userJSON = localStorage.getItem("user");
    if (userJSON) {
      const user = JSON.parse(userJSON);
      authByToken({ uid: user.uid, token: "12345" }).then((u: any) => {
        authComplete(u);
        if (u.battle) openPage({ name: "battlePlay", data: { act: "load", battle: u.battle } });
      });
    }
  }, []);
  useEffect(() => {}, []);
  return <></>;
};

export default AuthCheck;

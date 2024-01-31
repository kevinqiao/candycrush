import { useAction } from "convex/react";
import React, { createContext, useCallback, useContext } from "react";
import { useUserManager } from "service/UserManager";
import { api } from "../../../convex/_generated/api";

interface IMatch3AuthContext {
  signup: () => void;
  signin: (uid: string, token: string) => Promise<any>;
  allUser: () => Promise<any>;
}

const Match3AuthContext = createContext<IMatch3AuthContext>({
  signup: () => {
    return;
  },
  signin: (uid: string, token: string) => Promise.resolve(null),
  allUser: () => Promise.resolve(null), // Corrected to return a Promise
});

export const Match3AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { authComplete } = useUserManager();
  const signinByToken = useAction(api.UserService.signin);
  const findAllUser = useAction(api.UserService.findAllUser);
  const signup = useCallback(() => {
    console.log("signup");
  }, []);
  const signin = useCallback(
    async (uid: string, token: string) => {
      const user = await signinByToken({ uid, token });
      return user;
      // console.log(user);
      // if (user) {
      //   user.timelag = user.timestamp - Date.now();
      //   authComplete(user);
      // }
    },
    [signinByToken]
  );

  const value = {
    signup,
    signin,
    allUser: useCallback(async () => {
      return await findAllUser();
    }, []),
  };

  return <Match3AuthContext.Provider value={value}>{children}</Match3AuthContext.Provider>;
};
export const useMatch3AuthManager = () => {
  return useContext(Match3AuthContext);
};

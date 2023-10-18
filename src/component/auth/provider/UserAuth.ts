import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUserManager } from '../../../service/UserManager';

const useUserAuth = () => {
  const { authComplete } = useUserManager();
  const signin = useAction(api.UserService.signin);
  const findAllUser = useAction(api.UserService.findAllUser);

  const login = async (uid: string, token: string) => {
    const user = await signin({ uid, token })
    if (user)
      authComplete(user)
  };

  const logout = (): void => {

  };


  return {
    login,
    logout,
    findAllUser
  };
};


export default useUserAuth;

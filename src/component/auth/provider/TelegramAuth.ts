import { useUserManager } from '../../../service/UserManager';

const useTelegramAuth = () => {
  const { authComplete } = useUserManager();

  const login = (uid: string, token: string): void => {
    console.log(uid + ":" + token)
    authComplete({ uid, token })
  };

  const logout = (): void => {

  };

  return {
    login,
    logout,
  };
};

export default useTelegramAuth;

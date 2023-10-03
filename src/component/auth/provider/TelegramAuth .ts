import { useUserManager } from '../../../service/UserManager';

const useTelegramAuth = () => {
  const { authComplete } = useUserManager();

  const login = (uid: string, name: string): void => {
    console.log(uid + ":" + name)
    authComplete({ uid, name })
  };

  const logout = (): void => {

  };

  return {
    login,
    logout,
  };
};

export default useTelegramAuth;

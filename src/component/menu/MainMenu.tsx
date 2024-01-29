import { usePageManager } from "../../service/PageManager";
import "./menu.css";

const MainMenu: React.FC = () => {
  const { openPage } = usePageManager();
  const openBattle = () => {
    const url = "https://t.me/gamee";
    window.Telegram.WebApp.openTelegramLink(url);
  };
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 100,
        top: 20,
        right: 10,
        width: 70,
        height: 35,
        borderRadius: 4,
        backgroundColor: "white",
        color: "blue",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={openBattle}
    >
      Menu1
    </div>
  );
};

export default MainMenu;

import ReactDOM from "react-dom/client";
import TgApp from "./TgApp";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
console.log("telegram play");
setTimeout(() => {
  root.render(<TgApp />);
  window.Telegram.WebApp.expand();
  window.Telegram.WebApp.enableClosingConfirmation();
}, 1000);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./App.scss";
import RouteAll from "./components/RouteAll";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MusicPlayerProvider from "./contexts/MusicPlayerContext";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isPurchasePage = location.pathname.startsWith("/payment");
  console.log(isPurchasePage);

  return (
    <MusicPlayerProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <RouteAll />
      {(!isAdminPage && !isPurchasePage) && <MusicPlayer />}
    </MusicPlayerProvider>
  );
}

export default App;

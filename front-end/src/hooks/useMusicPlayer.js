import { useContext } from "react";
import { MusicPlayerContext } from "../contexts/MusicPlayerContextObject";

const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};

export default useMusicPlayer;

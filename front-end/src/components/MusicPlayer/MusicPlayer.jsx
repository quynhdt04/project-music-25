import React, { useRef, useEffect } from "react";
import useMusicPlayer from "../../hooks/useMusicPlayer";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
} from "react-icons/fa";
import "./MusicPlayer.scss";

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const {
    currentSong,
    isPlaying,
    volume,
    duration,
    currentTime,
    isPlayerVisible,
    togglePlay,
    setVolume,
    setDuration,
    setCurrentTime,
    nextSong,
    previousSong,
  } = useMusicPlayer();

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing audio:", error);
            // If playback failed, update UI state
            togglePlay();
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong, togglePlay]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update time as song plays
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Load audio metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle song end
  const handleEnded = () => {
    nextSong();
  };

  // Handle progress bar click
  const handleProgressBarClick = (e) => {
    if (progressBarRef.current && audioRef.current) {
      const progressBarRect = progressBarRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - progressBarRect.left;
      const progressBarWidth = progressBarRect.width;
      const seekTime = (clickPosition / progressBarWidth) * duration;

      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Format time (seconds -> mm:ss)
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle volume icon based on volume level
  const renderVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute />;
    if (volume < 0.5) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  // If no song is selected or player is not visible, don't render
  if (!currentSong || !isPlayerVisible) {
    return null;
  }

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={currentSong.audio || currentSong.url}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="music-player-container">
        <div className="song-info">
          <img
            src={currentSong.cover || "/default-album.jpg"}
            alt="Album cover"
            className="cover-image"
          />
          <div className="song-details">
            <h3 className="song-title">{currentSong.title}</h3>
            <p className="song-artist">{currentSong.artist}</p>
          </div>
        </div>

        <div className="player-controls">
          <div className="control-buttons">
            <button className="control-btn" onClick={previousSong}>
              <FaBackward />
            </button>
            <button className="control-btn play-pause" onClick={togglePlay}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button className="control-btn" onClick={nextSong}>
              <FaForward />
            </button>
          </div>

          <div className="progress-container">
            <span className="time">{formatTime(currentTime)}</span>
            <div
              className="progress-bar"
              ref={progressBarRef}
              onClick={handleProgressBarClick}
            >
              <div
                className="progress"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="volume-control">
          <button className="volume-icon">{renderVolumeIcon()}</button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;

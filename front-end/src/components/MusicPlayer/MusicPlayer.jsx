import React, { useRef, useEffect, useState } from "react";
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
import {
  Heart,
  Camera,
  ChatSquareText,
  MusicNoteList,
} from "react-bootstrap-icons";
import "./MusicPlayer.scss";

const MusicPlayer = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
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
      const volumeSlider = document.querySelector(".volume-slider");
      if (volumeSlider) {
        volumeSlider.style.setProperty(
          "--volume-percentage",
          `${volume * 100}%`
        );
      }
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

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };

  const handleMVClick = () => {
    // Handle MV click
    console.log("Open MV");
  };

  const handleLyricsClick = () => {
    setShowLyrics(!showLyrics);
  };

  const handleQueueClick = () => {
    setShowQueue(!showQueue);
  };

  const handleVolumeChange = (e) => {
    const value = e.target.value;
    setVolume(parseFloat(value));
    e.target.style.setProperty("--volume-percentage", `${value * 100}%`);
  };

  const handleVolumeDragStart = () => {
    setIsDraggingVolume(true);
  };

  const handleVolumeDragEnd = () => {
    setIsDraggingVolume(false);
  };

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
          <button
            className={`action-btn ${isLiked ? "liked" : ""}`}
            onClick={handleLikeClick}
          >
            <Heart />
          </button>
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
          <div className="song-actions d-flex align-items-center me-2 gap-2">
            {currentSong.hasVideo && (
              <button className="action-btn" onClick={handleMVClick}>
                <Camera />
              </button>
            )}
            <button
              className={`action-btn ${showLyrics ? "active" : ""}`}
              onClick={handleLyricsClick}
            >
              <ChatSquareText />
            </button>
            <button
              className={`action-btn ${showQueue ? "active" : ""}`}
              onClick={handleQueueClick}
            >
              <MusicNoteList />
            </button>
          </div>
          <div
            class="vr"
            style={{ backgroundColor: "#FFFFFF1A", opacity: 1 }}
          ></div>
          <button className="volume-icon">{renderVolumeIcon()}</button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            onMouseDown={handleVolumeDragStart}
            onMouseUp={handleVolumeDragEnd}
            onTouchStart={handleVolumeDragStart}
            onTouchEnd={handleVolumeDragEnd}
            className={`volume-slider ${isDraggingVolume ? "dragging" : ""}`}
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;

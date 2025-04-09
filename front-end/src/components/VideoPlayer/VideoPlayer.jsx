import React, { useState, useRef, useEffect } from "react";
import "./VideoPlayer.scss";
import {
  BsFillPlayFill,
  BsPauseFill,
  BsVolumeUp,
  BsFullscreen,
  BsDownload,
} from "react-icons/bs";

import { FaVolumeUp, FaVolumeDown, FaVolumeMute } from "react-icons/fa";

const VideoPlayer = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  //   const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Handle volume change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      const volumeSlider = document.querySelector(".volume-slider");
      if (volumeSlider) {
        volumeSlider.style.setProperty(
          "--volume-percentage",
          `${volume * 100}%`
        );
      }
    }
  }, [volume]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
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

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const progressWidth = progressBar.clientWidth;
    const newTime = (clickPosition / progressWidth) * duration;

    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  //   const toggleFullscreen = () => {
  //     if (!document.fullscreenElement) {
  //       containerRef.current?.requestFullscreen();
  //       setIsFullscreen(true);
  //     } else {
  //       document.exitFullscreen();
  //       setIsFullscreen(false);
  //     }
  //   };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const renderVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute />;
    if (volume < 0.5) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  const handleDownload = async () => {
    if (!data?.video) {
      console.error("No video URL available");
      return;
    }

    try {
      setIsDownloading(true);
      const response = await fetch(data.video);
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      console.log("url", url);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.title || "video"}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading video:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="video-player" ref={containerRef}>
      <div className="video-container">
        <video
          ref={videoRef}
          src={data.video}
          poster={data.cover}
          onClick={togglePlay}
          onTimeUpdate={() =>
            videoRef.current && setCurrentTime(videoRef.current.currentTime)
          }
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="video-controls">
          <div className="progress-container">
            <div className="progress" onClick={handleProgressClick}>
              <div
                className="progress-bar"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="time-info d-flex justify-content-between">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="controls-bottom d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <button className="btn" onClick={togglePlay}>
                {isPlaying ? (
                  <BsPauseFill size={24} />
                ) : (
                  <BsFillPlayFill size={24} />
                )}
              </button>
              <div className="volume-control d-flex align-items-center ms-3">
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
                  className={`volume-slider ${
                    isDraggingVolume ? "dragging" : ""
                  }`}
                />
              </div>
            </div>
            <div className="d-flex align-items-center">
              <button
                className="btn download-btn"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Download Video"
              >
                <BsDownload size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

import React, { useRef, useEffect, useState, useCallback } from "react";
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
  HeartFill,
  FilePlay,
  ChatSquareText,
  MusicNoteList,
  X,
} from "react-bootstrap-icons";
import { Container, Row, Col, Modal } from "react-bootstrap";
import "./MusicPlayer.scss";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import { like_song } from "../../services/SongServices";
import Media from "../Media/Media";

const MusicPlayer = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isLyricsClosing, setIsLyricsClosing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoClosing, setIsVideoClosing] = useState(false);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const lyricsContainerRef = useRef(null);

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
    showLyrics,
    setShowLyrics,
    showPremiumMessage,
    setShowPremiumMessage,
    queue,
    playSong,
  } = useMusicPlayer();

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing audio:", error);
            togglePlay();
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, togglePlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("timeupdate", updateTime);
    return () => audio.removeEventListener("timeupdate", updateTime);
  }, []);

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

  const handleLikeClick = async () => {
    // try {
    //   const result = await like_song(currentSong.slug);
    //   console.log(result);
    // } catch (error) {
    //   console.log(error);
    // }
    // setIsLiked(!isLiked);
  };

  const handleMVClick = () => {
    if (showVideo) {
      setIsVideoClosing(true);
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        setShowVideo(false);
        setIsVideoClosing(false);
        document.body.style.overflow = "";
      }, 300);
    } else {
      setShowVideo(true);
      togglePlay();
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        document.body.style.overflow = "";
      }, 300);
    }
  };

  const handleLyricsClick = () => {
    if (showLyrics) {
      setIsLyricsClosing(true);
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        setShowLyrics(false);
        setIsLyricsClosing(false);
        document.body.style.overflow = "";
      }, 300);
    } else {
      setShowLyrics(true);
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        document.body.style.overflow = "";
      }, 300);
    }
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

  // Add effect to handle lyrics scrolling
  useEffect(() => {
    if (!lyricsContainerRef.current || !currentSong?.lyrics) return;

    const currentLineIndex = currentSong.lyrics.findIndex(
      (line) =>
        currentTime >= +line.lyricStartTime && currentTime <= +line.lyricEndTime
    );

    if (currentLineIndex !== -1) {
      const lyricsContainer = lyricsContainerRef.current;
      const currentLine = lyricsContainer.children[currentLineIndex];

      if (currentLine) {
        const containerHeight = lyricsContainer.clientHeight;
        const lineTop = currentLine.offsetTop;
        const lineHeight = currentLine.clientHeight;

        // Calculate the scroll position to center the current line
        const scrollTo = lineTop - containerHeight / 2 + lineHeight / 2;

        // Smooth scroll to the current line
        lyricsContainer.scrollTo({
          top: scrollTo,
          behavior: "smooth",
        });
      }
    }
  }, [currentTime, currentSong?.lyrics]);

  // If no song is selected or player is not visible, don't render
  if (!currentSong || !isPlayerVisible) {
    return null;
  }

  const handlePlayClick = (e, song) => {
    e.preventDefault();
    // setSelectedItem(song.id);

    if (currentSong && currentSong.id === song.id) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  return (
    <div className="music-player-wrapper" style={{ position: "relative" }}>
      {!showVideo && (
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
                {isLiked ? <HeartFill /> : <Heart />}
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
                {currentSong.video && (
                  <button className="action-btn" onClick={handleMVClick}>
                    <FilePlay />
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
                className="vr"
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
                className={`volume-slider ${
                  isDraggingVolume ? "dragging" : ""
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {showVideo && (
        <div className="music-player-video">
          <div
            className={`music-player-video-container ${
              isVideoClosing ? "slide-down" : "slide-up"
            }`}
          >
            <div className="music-player-video-content">
              <div className="video-title d-flex justify-content-between align-items-center">
                <h3>
                  {currentSong.title} - {currentSong.artist}
                </h3>
                <div className="video-close-btn" onClick={handleMVClick}>
                  <X size={32} color="#fff" />
                </div>
              </div>
              <div className="video-wrapper">
                <VideoPlayer data={currentSong} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showLyrics && (
        <div className="music-player-lyrics">
          <div
            className={`music-player-lyrics-container ${
              isLyricsClosing ? "slide-down" : "slide-up"
            }`}
          >
            <div className="music-player-lyrics-content">
              <div className="music-player-lyrics-title">
                <h3>Lyrics</h3>
              </div>
              <Container>
                <Row>
                  <Col>
                    <div
                      ref={lyricsContainerRef}
                      className="lyrics-scroll-container"
                    >
                      {currentSong.lyrics.map((line, index) => (
                        <div
                          key={index}
                          className="music-player-lyric-line"
                          style={{
                            color:
                              currentTime >= +line.lyricStartTime &&
                              currentTime <= +line.lyricEndTime
                                ? "#c273ed"
                                : "white",
                            cursor: "pointer",
                            padding: "8px",
                            transition: "background-color 0.3s ease",
                          }}
                        >
                          {line.lyricContent}
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        </div>
      )}

      {/* Queue Section */}
      <div className={`music-player-queue ${showQueue ? "show" : ""}`}>
        <div className="queue-header">
          <h3>Queue</h3>
          <button className="close-btn" onClick={handleQueueClick}>
            <X size={24} />
          </button>
        </div>
        <div className="queue-list">
          {queue.map((song, index) => (
            <Media
              key={song.id}
              item={song}
              selectedItem={currentSong?.id}
              handlePlayClick={handlePlayClick}
              type="queue"
            />
          ))}
        </div>
      </div>

      {/* Premium Message Modal */}
      <Modal
        show={showPremiumMessage}
        onHide={() => setShowPremiumMessage(false)}
        centered
        className="premium-message-modal"
      >
        <Modal.Body className="premium-modal-body text-center">
          <h4>Premium Required</h4>
          <p>You must have premium to listen to the whole song</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowPremiumMessage(false)}
          >
            Close
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MusicPlayer;

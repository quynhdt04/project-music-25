import React, { useState, useEffect, useRef } from "react";
import { MusicPlayerContext } from "./MusicPlayerContextObject";
import { increment_song_playCount } from "../services/SongServices";

const MusicPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [queue, setQueue] = useState([]);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPremiumMessage, setShowPremiumMessage] = useState(false);

  // Premium timer related refs
  const premiumTimerRef = useRef(null);
  const isPremiumTimerActive = useRef(false);
  const hasShownPremiumMessage = useRef(false);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(30000); // 30 seconds in milliseconds
  const lastPauseTimeRef = useRef(null);

  // Play count tracking refs
  const playCountTimerRef = useRef(null);
  const hasIncrementedPlayCount = useRef(false);

  // Show player when a song is set
  useEffect(() => {
    if (currentSong) {
      setIsPlayerVisible(true);
    }
  }, [currentSong]);

  const pausePremiumTimer = () => {
    if (isPremiumTimerActive.current && premiumTimerRef.current) {
      clearTimeout(premiumTimerRef.current);
      lastPauseTimeRef.current = Date.now();
      const elapsedTime = lastPauseTimeRef.current - startTimeRef.current;
      remainingTimeRef.current -= elapsedTime;
      isPremiumTimerActive.current = false;
    }
  };

  const resumePremiumTimer = () => {
    if (currentSong?.isPremiumOnly) {
      if (hasShownPremiumMessage.current) {
        setIsPlaying(false);
        setShowPremiumMessage(true);
        return;
      }

      if (!isPremiumTimerActive.current && remainingTimeRef.current > 0) {
        isPremiumTimerActive.current = true;
        startTimeRef.current = Date.now();

        premiumTimerRef.current = setTimeout(() => {
          setIsPlaying(false);
          setShowPremiumMessage(true);
          hasShownPremiumMessage.current = true;
          isPremiumTimerActive.current = false;
          remainingTimeRef.current = 30000;
        }, remainingTimeRef.current);
      }
    }
  };

  // Reset premium message state when song changes
  useEffect(() => {
    hasShownPremiumMessage.current = false;
    remainingTimeRef.current = 30000;
    if (premiumTimerRef.current) {
      clearTimeout(premiumTimerRef.current);
    }
    isPremiumTimerActive.current = false;
  }, [currentSong]);

  // Handle premium timer when playing state changes
  useEffect(() => {
    if (isPlaying) {
      resumePremiumTimer();
    } else {
      pausePremiumTimer();
    }
  }, [isPlaying]);

  const incrementPlayCount = async () => {
    if (currentSong && !hasIncrementedPlayCount.current) {
      try {
        await increment_song_playCount(currentSong.id);
        hasIncrementedPlayCount.current = true;
      } catch (error) {
        console.error("Failed to increment play count:", error);
      }
    }
  };

  const startPlayCountTimer = () => {
    if (currentSong && !hasIncrementedPlayCount.current) {
      playCountTimerRef.current = setTimeout(() => {
        incrementPlayCount();
      }, 6000); // 6 seconds
    }
  };

  const clearPlayCountTimer = () => {
    if (playCountTimerRef.current) {
      clearTimeout(playCountTimerRef.current);
      playCountTimerRef.current = null;
    }
  };

  // Reset play count tracking when song changes
  useEffect(() => {
    hasIncrementedPlayCount.current = false;
    clearPlayCountTimer();
  }, [currentSong]);

  // Handle play count timer when playing state changes
  useEffect(() => {
    if (isPlaying) {
      startPlayCountTimer();
    } else {
      clearPlayCountTimer();
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPlayCountTimer();
      if (premiumTimerRef.current) {
        clearTimeout(premiumTimerRef.current);
      }
    };
  }, []);

  const playSong = (song) => {
    // Then set it as current song and start playing
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (queue.length === 0) {
      setIsPlaying(false);
      return;
    }

    const currentIndex = queue.findIndex((song) => song.id === currentSong.id);
    if (currentIndex === -1 || currentIndex === queue.length - 1) {
      // If current song not in queue or is last song, play first song in queue
      setCurrentSong(queue[0]);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    } else {
      // Play next song in queue
      setCurrentSong(queue[currentIndex + 1]);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
  };

  const previousSong = () => {
    if (queue.length === 0) {
      setIsPlaying(false);
      return;
    }

    const currentIndex = queue.findIndex((song) => song.id === currentSong.id);
    if (currentIndex === -1 || currentIndex === 0) {
      // If current song not in queue or is first song, play last song in queue
      setCurrentSong(queue[queue.length - 1]);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    } else {
      // Play previous song in queue
      setCurrentSong(queue[currentIndex - 1]);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
  };

  const addToQueue = (song) => {
    if (Array.isArray(song)) {
      setQueue([...queue, ...song]);
    } else {
      setQueue([...queue, song]);
    }
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const value = {
    currentSong,
    isPlaying,
    volume,
    duration,
    currentTime,
    isPlayerVisible,
    queue,
    showLyrics,
    showPremiumMessage,
    playSong,
    togglePlay,
    setVolume,
    setDuration,
    setCurrentTime,
    nextSong,
    previousSong,
    addToQueue,
    clearQueue,
    setIsPlayerVisible,
    setShowLyrics,
    setShowPremiumMessage,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export default MusicPlayerProvider;

import React, { useState, useEffect, useRef } from "react";
import { MusicPlayerContext } from "./MusicPlayerContextObject";
import {
  increment_song_playCount,
  checkIsSongLikedByCurrentUser,
  get_song_by_id,
} from "../services/SongServices";

const MusicPlayerProvider = ({ children }) => {
  const [isLiked, setIsLiked] = useState(false);
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

  const getAudioDuration = (audioUrl) => {
    return new Promise((resolve) => {
      const audio = new Audio();

      // Add error handling
      audio.addEventListener("error", () => {
        console.error("Error loading audio:", audioUrl);
        resolve(0); // Return 0 duration on error
      });

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn("Audio metadata loading timed out:", audioUrl);
        resolve(0); // Return 0 duration on timeout
      }, 5000); // 5 second timeout

      audio.addEventListener("loadedmetadata", () => {
        clearTimeout(timeout);
        resolve(audio.duration);
      });

      audio.src = audioUrl;
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const fetchQueueData = async () => {
    try {
      const currentQueue = JSON.parse(localStorage.getItem("currentQueue"));
      if (currentQueue) {
        const songs = await Promise.all(currentQueue.map(async (song) => {
          const songData = await get_song_by_id(song.id);

          const duration = await getAudioDuration(songData.data.audio);

          return {
            id: songData.data.id,
            title: songData.data.title,
            cover: songData.data.avatar,
            description: songData.data.description,
            artist: songData.data.singers.map((item) => item.singerName).join(", "),
            album: songData.data.albums?.map((item) => item.title).join(", ") || "",
            audio: songData.data.audio,
            video: songData.data.video,
            lyrics: songData.data.lyrics,
            like: songData.data.like,
            isPremiumOnly: songData.data.isPremiumOnly,
            playCount: songData.data.play_count,
            duration: formatDuration(duration),
          };
        }));
        console.log("Queue", songs)
        setQueue(songs);
        return true;
      }
    } catch (e) {
      console.log(e)
      return false;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const currentSong = JSON.parse(localStorage.getItem("currentSong"));

      if (user && currentSong) {
        const response = await checkIsSongLikedByCurrentUser(
          currentSong.id,
          user.id
        );

        if (response.status === 200) {
          setIsLiked(response.isLiked);
        }
      }
    };

    fetchData();
    fetchQueueData();
  }, []);

  // Show the last song that the user played
  useEffect(() => {
    const currentSong = JSON.parse(localStorage.getItem("currentSong"));

    if (currentSong) {
      setCurrentSong(currentSong);
    }
  }, []);

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
    localStorage.setItem("currentSong", JSON.stringify(song));
    addToQueue(song);

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
    let nextSong = null;
    if (currentIndex === -1 || currentIndex === queue.length - 1) {
      nextSong = queue[0];
      // If current song not in queue or is last song, play first song in queue
      setCurrentSong(nextSong);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    } else {
      // Play next song in queue
      nextSong = queue[currentIndex + 1];
      setCurrentSong(nextSong);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
    localStorage.setItem("currentSong", JSON.stringify(nextSong));
  };

  const previousSong = () => {
    if (queue.length === 0) {
      setIsPlaying(false);
      return;
    }

    const currentIndex = queue.findIndex((song) => song.id === currentSong.id);
    let prevSong = null;
    if (currentIndex === -1 || currentIndex === 0) {
      // If current song not in queue or is first song, play last song in queue
      prevSong = queue[queue.length - 1];
      console.log("PrevSong: ", prevSong);
      setCurrentSong(prevSong);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    } else {
      // Play previous song in queue
      prevSong = queue[currentIndex - 1];
      console.log("PrevSong: ", prevSong);
      setCurrentSong(prevSong);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
    localStorage.setItem("currentSong", JSON.stringify(prevSong));
  };

  const addToQueue = (song) => {
    let newQueue = [...queue];
    if (Array.isArray(song)) {
      // Filter out songs that are already in the queue
      const newSongs = song.filter(
        (newSong) =>
          !queue.some((existingSong) => existingSong.id === newSong.id)
      )
      .map((song) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
      }));
      if (newSongs.length > 0) {
        newQueue = [...newQueue, ...newSongs];
        setQueue(newQueue);
      }
    } else {
      // Check if the single song is not already in the queue
      if (!queue.some((existingSong) => existingSong.id === song.id)) {
        newQueue = [...newQueue, { id: song.id, title: song.title, artist: song.artist }];
        setQueue(newQueue);
      }
    }
    localStorage.setItem("currentQueue", JSON.stringify(newQueue));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const moveSong = (song, direction) => {
    const songIndex = queue.findIndex((item) => item.id === song.id);

    if (songIndex === -1) return; // Song not found in queue

    const newQueue = [...queue];

    if (direction === "up" && songIndex > 0) {
      // Swap with previous song
      [newQueue[songIndex], newQueue[songIndex - 1]] = [
        newQueue[songIndex - 1],
        newQueue[songIndex],
      ];
      setQueue(newQueue);
    } else if (direction === "down" && songIndex < newQueue.length - 1) {
      // Swap with next song
      [newQueue[songIndex], newQueue[songIndex + 1]] = [
        newQueue[songIndex + 1],
        newQueue[songIndex],
      ];
      setQueue(newQueue);
    }

    localStorage.setItem("currentQueue", JSON.stringify(newQueue));
  };

  const removeSongFromQueue = (song) => {
    if (!song) return;
    setQueue((prevQueue) => {
      const currentQueue = prevQueue || [];
      const newQueue = currentQueue.filter((item) => item.id !== song.id);
      localStorage.setItem("currentQueue", JSON.stringify(newQueue));
      return newQueue;
    });
  };

  const value = {
    isLiked,
    currentSong,
    isPlaying,
    volume,
    duration,
    currentTime,
    isPlayerVisible,
    queue,
    showLyrics,
    showPremiumMessage,
    setIsLiked,
    setCurrentSong,
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
    moveSong,
    removeSongFromQueue,
    getAudioDuration,
    formatDuration,
    fetchQueueData
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export default MusicPlayerProvider;

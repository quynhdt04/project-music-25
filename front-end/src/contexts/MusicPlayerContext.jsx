import React, { useState, useEffect } from "react";
import { MusicPlayerContext } from "./MusicPlayerContextObject";

const MusicPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [queue, setQueue] = useState([]);

  // Show player when a song is set
  useEffect(() => {
    console.log("Use effect setIsPlayerVisible triggered");
    if (currentSong) {
      setIsPlayerVisible(true);
    }
  }, [currentSong]);

  const playSong = (song) => {
    console.log("Queue when play first song", queue);
    // console.log("Queue before", queue);
    // // First remove the song from queue if it exists there
    // const updatedQueue = queue.filter((item) => item.id !== song.id);
    // setQueue(updatedQueue);
    // console.log("Queue after", updatedQueue);

    // Then set it as current song and start playing
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    console.log("Queue", queue);
    if (queue.length === 0) {
      setIsPlaying(false);
      return;
    }

    // Just play the first song in queue
    const nextSongToPlay = queue[0];
    console.log("Next song", nextSongToPlay);

    // Remove it from queue first
    const updatedQueue = queue.slice(1);
    console.log("Updated queue", updatedQueue);
    setQueue(updatedQueue);

    // Then set it as current song
    setCurrentSong(nextSongToPlay);
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
    } else {
      // Play previous song in queue
      setCurrentSong(queue[currentIndex - 1]);
    }
  };

  const addToQueue = (song) => {
    setQueue([...queue, song]);
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
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export default MusicPlayerProvider;

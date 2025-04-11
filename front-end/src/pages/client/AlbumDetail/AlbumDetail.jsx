import React, { useState, useEffect } from "react";
import "./AlbumDetail.scss";
import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import TestImage from "../../../assets/2024-12-08.png";
import { Link, useParams } from "react-router-dom";
import { SuitHeart, ThreeDots, Plus } from "react-bootstrap-icons";
import { FaPlay, FaPause } from "react-icons/fa";
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { get_topic_by_slug } from "../../../services/TopicServices";
import {
  get_songs_by_topic_slug,
  get_song_by_slug,
} from "../../../services/SongServices";
import Media from "../../../components/Media/Media";

const AlbumDetail = () => {
  const [songs, setSongs] = useState([]);
  const [dataInfo, setDataInfo] = useState({});
  const [selectedItem, setSelectedItem] = useState("");
  const [fetchStatus, setFetchStatus] = useState({
    isLoading: false,
    isError: false,
  });
  const { type, id } = useParams();
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } =
    useMusicPlayer();

  const isCurrentSong =
    currentSong &&
    songs.filter((song) => {
      return currentSong.id === song.id;
    });

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

  useEffect(() => {
    const fetchAlbumInfo = async () => {
      try {
        setFetchStatus({
          isLoading: true,
          isError: false,
        });

        if (type === "topic") {
          const [topicInfo, songsData] = await Promise.all([
            get_topic_by_slug(id),
            get_songs_by_topic_slug(id),
          ]);

          const topicInfoData = {
            id: topicInfo.topic.id,
            title: topicInfo.topic.title,
            cover: topicInfo.topic.avatar,
            description: topicInfo.topic.description,
          };

          console.log("Songs data:", songsData);

          const songsWithDuration = await Promise.all(
            songsData.data.map(async (song) => {
              const duration = await getAudioDuration(song.audio);
              return {
                id: song._id,
                title: song.title,
                cover: song.avatar,
                description: song.description,
                artist: song.singers.map((item) => item.singerName).join(", "),
                audio: song.audio,
                video: song.video,
                lyrics: song.lyrics,
                like: song.like,
                isPremiumOnly: song.isPremiumOnly,
                playCount: song.play_count,
                duration: formatDuration(duration),
              };
            })
          );

          setDataInfo(topicInfoData);
          setSongs(songsWithDuration);
        } else if (type === "song") {
          const songInfo = await get_song_by_slug(id);
          const songInfoData = {
            id: songInfo.data.id,
            title: songInfo.data.title,
            cover: songInfo.data.avatar,
            description: songInfo.data.description,
            artist: songInfo.data.singers
              .map((item) => item.singerName)
              .join(", "),
            like: songInfo.data.like,
          };

          console.log("Song info data:", songInfoData);

          const duration = await getAudioDuration(songInfo.data.audio);
          const songsWithDuration = {
            id: songInfo.data.id,
            title: songInfo.data.title,
            cover: songInfo.data.avatar,
            description: songInfo.data.description,
            singers: songInfo.data.singers
              .map((item) => item.singerName)
              .join(", "),
            audio: songInfo.data.audio,
            video: songInfo.data.video,
            lyrics: songInfo.data.lyrics,
            like: songInfo.data.like,
            isPremiumOnly: songInfo.data.isPremiumOnly,
            playCount: songInfo.data.play_count,
            duration: formatDuration(duration),
          };

          setDataInfo(songInfoData);
          setSongs([songsWithDuration]);
        }

        setFetchStatus({
          isLoading: false,
          isError: false,
        });
      } catch (error) {
        console.error("Error fetching album info:", error);
        setFetchStatus({
          isLoading: false,
          isError: true,
        });
      }
    };

    fetchAlbumInfo();
  }, [id, type]);

  useEffect(() => {
    console.log("dataInfo updated:", dataInfo);
  }, [dataInfo]);

  const handlePlayAllClick = (e) => {
    e.preventDefault();

    if (
      currentSong &&
      songs.some((song) => song.id === currentSong.id) &&
      isPlaying
    ) {
      togglePlay();
    } else {
      playSong(songs[0]);
      addToQueue([...songs]);
    }
  };

  const handlePlayClick = (e, song) => {
    e.preventDefault();
    setSelectedItem(song.id);

    if (currentSong && currentSong.id === song.id) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  // const handleAddToQueue = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   addToQueue(song);
  // };

  if (fetchStatus.isLoading) {
    return (
      <div className="loading-overlay">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Xin vui lòng chờ đợi trong giây lát...</p>
      </div>
    );
  }

  return (
    <Container className="album-detail-container">
      <Row className="py-4 album-detail-row d-flex">
        <Col className="px-0 album-detail-left-col">
          <div className="media">
            <div className="media-header">
              <div className="img-container">
                <img src={dataInfo.cover || TestImage} />
              </div>
            </div>
            <div className="media-content d-flex flex-column align-items-center">
              <div className="media-content-top text-center">
                <h5 className="my-0">{dataInfo.title}</h5>
                <div
                  className="media-content-top__singer"
                  style={{ color: "#FFFFFF80" }}
                >
                  {type !== "topic" ? (
                    <>
                      <span style={{ fontSize: "12px", color: "#FFFFFF80" }}>
                        {dataInfo.artist}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#FFFFFF80" }}>
                      {dataInfo.description}
                    </span>
                  )}
                </div>
                {type !== "topic" && (
                  <div className="text-center">
                    <span style={{ fontSize: "12px", color: "#FFFFFF80" }}>
                      {dataInfo.playCount} người yêu thích
                    </span>
                  </div>
                )}
              </div>
              <div className="media-content-bottom mt-3">
                <Button className="btn-play-all d-flex align-items-center mb-3">
                  {isCurrentSong && isPlaying ? <FaPause /> : <FaPlay />}
                  <span className="ms-2" onClick={handlePlayAllClick}>
                    Phát tất cả
                  </span>
                </Button>
                <div className="song-action d-flex align-items-center justify-content-center">
                  <Button className="btn-action p-0 me-3 like-button">
                    <div className="img-container">
                      <SuitHeart />
                    </div>
                  </Button>
                  <Button className="btn-action p-0  queue-button">
                    <div className="img-container">
                      <ThreeDots />
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col className="px-0 ms-4 album-detail-right-col">
          <div className="album-detail__content">
            {type !== "album" && (
              <div className="description mb-2">
                <span style={{ color: "#FFFFFF80", fontSize: "14px" }}>
                  Lời tựa:{" "}
                </span>
                <span style={{ fontSize: "14px" }}>{dataInfo.description}</span>
              </div>
            )}
            <div className="table-header d-flex align-items-center">
              <div className="header-left" style={{ flex: "5%" }}>
                <span
                  style={{
                    textTransform: "uppercase",
                    fontSize: "12px",
                    color: "#FFFFFF80",
                  }}
                >
                  {/* Empty header for queue button column */}
                </span>
              </div>
              <div className="header-left" style={{ flex: "40%" }}>
                <span
                  style={{
                    textTransform: "uppercase",
                    fontSize: "12px",
                    color: "#FFFFFF80",
                  }}
                >
                  Bài hát
                </span>
              </div>
              <div
                className="header-center"
                style={{
                  flex: "45%",
                  visibility: `${type !== "song" ? "visible" : "hidden"}`,
                }}
              >
                <span
                  style={{
                    textTransform: "uppercase",
                    fontSize: "12px",
                    color: "#FFFFFF80",
                  }}
                >
                  Album
                </span>
              </div>
              <div className="header-right" style={{ flex: "10%" }}>
                <span
                  style={{
                    textTransform: "uppercase",
                    fontSize: "12px",
                    color: "#FFFFFF80",
                  }}
                >
                  Thời gian
                </span>
              </div>
            </div>
            <div>
              {songs.map((item, index) => (
                <Media
                  key={index}
                  item={item}
                  selectedItem={selectedItem}
                  handlePlayClick={handlePlayClick}
                  index={index}
                />
              ))}
            </div>
          </div>
        </Col>
      </Row>
      <Row className="artist-row d-flex flex-column my-4 pb-5">
        <Col className="px-0 mb-4">
          <h5 style={{ fontWeight: "600" }}>Nghệ Sĩ Tham Gia</h5>
        </Col>
        <Col className="px-0">
          <Row className="d-flex align-items-center">
            <Col className="px-0">
              <div className="artist-item-wrapper">
                <div className="artist-item-card d-flex flex-column align-items-center">
                  <div className="card-header">
                    <div className="img-container">
                      <img src={TestImage} />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="title text-center">
                      <span
                        style={{
                          margin: "15px 0 4px",
                          display: "inline-block",
                        }}
                      >
                        Vũ Cát Tường
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col className="px-0">
              <div className="artist-item-wrapper">
                <div className="artist-item-card d-flex flex-column align-items-center">
                  <div className="card-header">
                    <div className="img-container">
                      <img src={TestImage} />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="title text-center">
                      <span
                        style={{
                          margin: "15px 0 4px",
                          display: "inline-block",
                        }}
                      >
                        Vũ Cát Tường
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col className="px-0">
              <div className="artist-item-wrapper">
                <div className="artist-item-card d-flex flex-column align-items-center">
                  <div className="card-header">
                    <div className="img-container">
                      <img src={TestImage} />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="title text-center">
                      <span
                        style={{
                          margin: "15px 0 4px",
                          display: "inline-block",
                        }}
                      >
                        Vũ Cát Tường
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col className="px-0">
              <div className="artist-item-wrapper">
                <div className="artist-item-card d-flex flex-column align-items-center">
                  <div className="card-header">
                    <div className="img-container">
                      <img src={TestImage} />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="title text-center">
                      <span
                        style={{
                          margin: "15px 0 4px",
                          display: "inline-block",
                        }}
                      >
                        Vũ Cát Tường
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col className="px-0">
              <div className="artist-item-wrapper">
                <div className="artist-item-card d-flex flex-column align-items-center">
                  <div className="card-header">
                    <div className="img-container">
                      <img src={TestImage} />
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="title text-center">
                      <span
                        style={{
                          margin: "15px 0 4px",
                          display: "inline-block",
                        }}
                      >
                        Vũ Cát Tường
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default AlbumDetail;

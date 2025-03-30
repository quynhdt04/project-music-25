import React, { useState, useEffect } from "react";
import "./AlbumDetail.scss";
import { Button, Col, Container, Row } from "react-bootstrap";
import TestImage from "../../../assets/2024-12-08.png";
import { Link, useParams } from "react-router-dom";
import { PlayFill, SuitHeart, ThreeDots } from "react-bootstrap-icons";
import { FaPlay, FaPause } from "react-icons/fa";
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import TestAudio from "../../../assets/Không Phải Dạng Vừa Đâu (Lyrics Video) - M-TP Audio.mp3";
import TestAudio2 from "../../../assets/Thoại 001.m4a";

const AlbumDetail = () => {
  const [songs, setSongs] = useState([]);
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } =
    useMusicPlayer();

  const isCurrentSong =
    currentSong &&
    songs.filter((song) => {
      return currentSong.id === song.id;
    });

  useEffect(() => {
    const songs = [
      {
        id: 1,
        title: "Ngủ một mình",
        cover: TestImage,
        artist: "Nguyễn Đình Vũ",
        album: "Ngủ một mình (Single)",
        duration: "4:00",
        audio: TestAudio,
      },
      {
        id: 2,
        title: "Ngủ một mình",
        cover: TestImage,
        artist: "Nguyễn Đình Vũ",
        album: "Ngủ một mình (Single)",
        duration: "4:00",
        audio: TestAudio2,
      },
      {
        id: 3,
        title: "Ngủ một mình",
        cover: TestImage,
        artist: "Nguyễn Đình Vũ",
        album: "Ngủ một mình (Single)",
        duration: "4:00",
        audio: TestAudio,
      },
      {
        id: 4,
        title: "Ngủ một mình",
        cover: TestImage,
        artist: "Nguyễn Đình Vũ",
        album: "Ngủ một mình (Single)",
        duration: "4:00",
        audio: TestAudio2,
      },
    ];
    setSongs(songs);
  }, []);

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

  return (
    <Container className="album-detail-container">
      <Row className="py-4 album-detail-row d-flex">
        <Col className="px-0 album-detail-left-col">
          <div className="media">
            <div className="media-header">
              <div className="img-container">
                <img src={TestImage} />
              </div>
            </div>
            <div className="media-content d-flex flex-column align-items-center">
              <div className="media-content-top text-center">
                <h5 className="my-0">Ngủ một mình &#40;Single&#41;</h5>
                <div
                  className="media-content-top__singer"
                  style={{ color: "#FFFFFF80" }}
                >
                  <Link
                    to={"/singer/1"}
                    style={{
                      fontSize: "12px",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    Nguyễn Đình Vũ
                  </Link>
                  ,{" "}
                  <Link
                    to={"/singer/2"}
                    style={{
                      fontSize: "12px",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    Hoàng Dũng
                  </Link>
                  ,{" "}
                  <Link
                    to={"/singer/3"}
                    style={{
                      fontSize: "12px",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    Hòa Minzy
                  </Link>
                </div>
                <div className="text-center">
                  <span style={{ fontSize: "12px", color: "#FFFFFF80" }}>
                    701 người yêu thích
                  </span>
                </div>
              </div>
              <div className="media-content-bottom mt-3">
                <Button className="btn-play-all d-flex align-items-center mb-3">
                  {isCurrentSong && isPlaying ? <FaPause /> : <FaPlay />}
                  {/* <PlayFill /> */}
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
            <div className="description mb-2">
              <span style={{ color: "#FFFFFF80", fontSize: "14px" }}>
                Lời tựa:{" "}
              </span>
              <span style={{ fontSize: "14px" }}>
                Dừng lại đây, thả trôi cùng những bài hát bồng bềnh tựa làn mây
              </span>
            </div>
            <div className="table-header d-flex align-items-center">
              <div className="header-left" style={{ flex: "45%" }}>
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
              <div className="header-center" style={{ flex: "45%" }}>
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
                <div
                  className={`song-item-wrapper ${
                    index === 0 ? "active" : ""
                  } d-flex align-items-center mt-2`}
                  key={item.id}
                >
                  <div
                    className="song-item d-flex align-items-center"
                    style={{ flex: 1 }}
                  >
                    <div
                      className="item-left d-flex align-items-center"
                      style={{ flex: "45%" }}
                    >
                      <div className="song-thumb" style={{ cursor: "pointer" }}>
                        <img
                          src={item.cover || TestImage}
                          alt="song"
                          onClick={(e) => handlePlayClick(e, item)}
                        />
                      </div>
                      <div className="song-info ms-3">
                        <div
                          className="song-name"
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            lineHeight: "1.5",
                          }}
                        >
                          {item.title}
                        </div>
                        <div className="song-singer">
                          <Link
                            to={"/singer/1"}
                            style={{
                              fontSize: "12px",
                              textDecoration: "none",
                              color: "#FFFFFF80",
                              cursor: "pointer",
                            }}
                          >
                            {item.artist}
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div
                      className="item-center d-flex align-items-center"
                      style={{ flex: "45%" }}
                    >
                      <div className="album-name">
                        <span style={{ fontSize: "13px", color: "#FFFFFF80" }}>
                          {item.album}
                        </span>
                      </div>
                    </div>
                    <div
                      className="item-right d-flex align-items-center justify-content-center"
                      style={{ flex: "10%" }}
                    >
                      <div className="duration">
                        <span style={{ fontSize: "13px", color: "#FFFFFF80" }}>
                          {item.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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

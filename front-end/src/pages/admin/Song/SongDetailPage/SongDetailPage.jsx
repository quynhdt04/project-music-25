import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { Calendar, Clock, Person, PersonCheck } from "react-bootstrap-icons";
import "./SongDetailPage.scss";
import { get_song_by_id } from "../../../../services/SongServices";
import { color } from "@cloudinary/url-gen/qualifiers/background";

const getStatusClass = (status) => {
  const statusMap = {
    approved: "status-green",
    rejected: "status-red",
    pending: "status-grey",
  };
  return statusMap[status] || "";
};

const getStatusLabel = (status) => {
  const statusMap = {
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
    pending: "Đang chờ duyệt",
  };
  return statusMap[status] || status;
};

const getDeletedStatusClass = (isDeleted) => {
  return isDeleted === true ? "status-red" : "status-green";
};

const getDeletedStatusLabel = (isDeleted) => {
  return isDeleted === true ? "Đã xóa" : "Chưa xóa";
};

const getPremiumStatusClass = (isPremium) => {
  return isPremium === true ? "status-green" : "status-grey";
};

const getPremiumStatusLabel = (isPremium) => {
  return isPremium === true ? "Chỉ Premium" : "Miễn phí";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusOptions = [
  {
    value: "approved",
    label: "Đã duyệt",
    className: "status-green",
    color: "rgba(0, 200, 0, 0.1)",
  },
  {
    value: "rejected",
    label: "Đã từ chối",
    className: "status-red",
    color: "rgba(255, 0, 0, 0.1)",
  },
  {
    value: "pending",
    label: "Đang chờ duyệt",
    className: "status-grey",
    color: "rgba(128, 128, 128, 0.1)",
  },
];

const customStyles = {
  control: (styles) => ({
    ...styles,
    minHeight: "30px",
    height: "40px",
    width: "200px",
    fontSize: "14px",
  }),
  valueContainer: (styles) => ({
    ...styles,
    height: "30px",
    padding: "0 6px",
  }),
  singleValue: (styles, state) => ({
    ...styles,
    color: state.data.color,
  }),
  option: (styles, state) => {
    const color = state.data.color;
    console.log("state: ", state);
    return {
      ...styles,
      backgroundColor: state.isFocused ? color : "transparent",
      color: state.data.color,
      padding: "10px",
      display: "flex",
      alignItems: "center",
    };
  },
};

const SongDetailPage = ({ managementPage = "songs" }) => {
  const [song, setSong] = useState({});
  const [fetchingStatus, setFetchingStatus] = useState({
    isLoading: true,
    isError: false,
  });
  const { id } = useParams();

  const fetchData = useCallback(async () => {
    try {
      setFetchingStatus({ isLoading: true, isError: false });
      let songByIdResponse = null;
      let formattedData = null;
      switch (managementPage) {
        // case "songs-approval": {

        // }
        default: {
          songByIdResponse = await get_song_by_id(id);
          formattedData = {
            songId: songByIdResponse.data._id,
            title: songByIdResponse.data.title,
            avatar: songByIdResponse.data.avatar,
            audio: songByIdResponse.data.audio,
            video: songByIdResponse.data.video,
            description: songByIdResponse.data.description,
            singers: songByIdResponse.data.singers.map((singer) => ({
              value: singer.singerId,
              label: singer.singerName,
            })),
            topics: songByIdResponse.data.topics.map((topic) => ({
              value: topic.topicId,
              label: topic.topicName,
            })),
            like: songByIdResponse.data.like,
            lyrics: songByIdResponse.data.lyrics.map((sentence) => ({
              content: sentence.lyricContent,
              beginAt: sentence.lyricStartTime,
              endAt: sentence.lyricEndTime,
            })),
            status: songByIdResponse.data.status,
            isPremiumOnly: songByIdResponse.data.isPremiumOnly,
            createdBy: songByIdResponse.data.createdBy,
            approvedBy: songByIdResponse.data.approvedBy,
            deleted: songByIdResponse.data.deleted,
            createdAt: songByIdResponse.data.createdAt,
            updatedAt: songByIdResponse.data.updatedAt,
          };
        }
      }
      setSong(formattedData);
      setFetchingStatus({ isLoading: false, isError: false });
    } catch (error) {
      console.error("Failed to fetch data: ", error);
      setFetchingStatus({ isLoading: false, isError: true });
    }
  }, [id, managementPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (fetchingStatus.isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Xin vui lòng chờ đợi trong giây lát...</p>
      </div>
    );
  }

  if (fetchingStatus.isError) {
    return <Alert variant="danger">Đã xảy ra lỗi khi tải dữ liệu</Alert>;
  }

  return (
    <Container fluid className="song-detail-container">
      <Card className="song-detail-card">
        {/* Header Section */}
        <Card.Header className="song-detail-header">
          <div className="d-flex justify-content-between align-items-start">
            <div style={{ flexBasis: "50%" }}>
              <h2 className="song-title">{song.title}</h2>
              <div className="song-id">ID: {song.songId}</div>
            </div>
            <div
              className="d-flex flex-column align-items-end"
              style={{ flexBasis: "50%" }}
            >
              {managementPage === "songs" ? (
                <>
                  <span>
                    Trạng thái Premium:{" "}
                    <span
                      className={`status-badge ${getPremiumStatusClass(
                        song.status
                      )}`}
                    >
                      {getPremiumStatusLabel(song.status)}
                    </span>
                  </span>
                  <span>
                    Trạng thái duyệt:{" "}
                    <span
                      className={`status-badge mt-2 ${getStatusClass(
                        song.status
                      )}`}
                    >
                      {getStatusLabel(song.status)}
                    </span>
                  </span>
                  <span>
                    Trạng thái xóa:{" "}
                    <span
                      className={`status-badge mt-2 ${getDeletedStatusClass(
                        song.deleted
                      )}`}
                    >
                      {getDeletedStatusLabel(song.deleted)}
                    </span>
                  </span>
                </>
              ) : (
                <div className="d-flex">
                  <Select
                    classNamePrefix="react-select"
                    options={statusOptions}
                    styles={customStyles}
                    getOptionLabel={(e) => (
                      <div className={`status-badge ${e.className}`}>
                        {e.label}
                      </div>
                    )}
                    getOptionValue={(e) => e.value}
                  />
                  <Button
                    className="ms-3"
                    style={{
                      backgroundColor: "#6f42c1",
                      padding: "0.5rem 1rem",
                    }}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Media Section */}
          <Row className="mb-4">
            <Col md={4}>
              <div className="song-avatar">
                <img
                  src={song.avatar}
                  alt={song.title}
                  className="img-fluid rounded"
                />
              </div>
            </Col>
            <Col md={8}>
              <div className="song-info">
                <div className="info-group">
                  <h5>Mô tả</h5>
                  <p>{song.description || "No description available"}</p>
                </div>

                <div className="info-group">
                  <h5>Ca sĩ</h5>
                  <div className="tags-container">
                    {song.singers.map((singer, index) => (
                      <span key={index} className="tag singer-tag">
                        {singer.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="info-group">
                  <h5>Thể loại</h5>
                  <div className="tags-container">
                    {song.topics.length > 0 ? (
                      song.topics.map((topic, index) => (
                        <span key={index} className="tag topic-tag">
                          {topic.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">No topics assigned</span>
                    )}
                  </div>
                </div>

                <div className="info-group">
                  <h5>Likes</h5>
                  <span className="like-count">{song.likes || 0} likes</span>
                </div>
              </div>
            </Col>
          </Row>

          {/* Audio Player Section */}
          <Row className="mb-4">
            <Col md={12}>
              <div className="audio-section">
                <h5>Audio Track</h5>
                <audio controls className="w-100">
                  <source src={song.audio} type="audio/mpeg" />
                  Trình duyệt của bạn không hỗ trợ phát nhạc.
                </audio>
              </div>
            </Col>
          </Row>

          {/* Video Player Section */}
          {song.video && (
            <Row className="mb-4">
              <Col md={12}>
                <div className="video-section">
                  <h5>Music Video</h5>
                  <div className="video-container">
                    <video controls className="w-100">
                      <source src={song.video} type="video/mp4" />
                      Trình duyệt của bạn không hỗ trợ phát video.
                    </video>
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {/* Lyrics Section */}
          <Row className="mb-4">
            <Col md={12}>
              <div className="lyrics-section">
                <h5>Lời bài hát</h5>
                <div className="lyrics-container">
                  {song.lyrics.map((line, index) => (
                    <div key={index} className="lyric-line">
                      <span className="lyric-content">{line.content}</span>
                      <span className="lyric-timestamp">
                        {line.beginAt}s - {line.endAt}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>

          {/* Timestamps */}
          <Row>
            <Col md={6}>
              <div className="timestamps justify-content-start">
                <div className="timestamp-item">
                  <Calendar className="icon" />
                  <span>Ngày tạo: {formatDate(song.createdAt)}</span>
                </div>
                <div className="timestamp-item">
                  <Clock className="icon" />
                  <span>Ngày cập nhật: {formatDate(song.updatedAt)}</span>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="timestamps justify-content-end">
                <div className="timestamp-item">
                  <Person className="icon" />
                  <span>Người tạo: {song.createdBy}</span>
                </div>
                <div className="timestamp-item">
                  <PersonCheck className="icon" />
                  <span>Người duyệt: {song.approvedBy}</span>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SongDetailPage;

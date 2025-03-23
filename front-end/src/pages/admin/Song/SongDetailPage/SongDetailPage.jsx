import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Calendar, Clock } from "react-bootstrap-icons";
import "./SongDetailPage.scss";

const SongDetailPage = ({ song }) => {
  console.log(song);

  const getStatusClass = (status) => {
    const statusMap = {
      active: "status-green",

      inactive: "status-red",
    };
    return statusMap[status] || "";
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      active: "Đang hoạt động",
      inactive: "Đã ẩn",
    };
    return statusMap[status] || status;
  };

  const getDeletedStatusClass = (isDeleted) => {
    return isDeleted === true ? "status-red" : "status-green";
  };

  const getDeletedStatusLabel = (isDeleted) => {
    return isDeleted === true ? "Đã xóa" : "Chưa xóa";
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

  return (
    <Container fluid className="song-detail-container">
      <Card className="song-detail-card">
        {/* Header Section */}
        <Card.Header className="song-detail-header">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="song-title">{song.title}</h2>
              <div className="song-id">ID: {song.songId}</div>
            </div>
            <div className="d-flex flex-column align-items-end">
              <span>
                Trạng thái hoạt động:{" "}
                <span className={`status-badge ${getStatusClass(song.status)}`}>
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
            <Col md={12}>
              <div className="timestamps">
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
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SongDetailPage;

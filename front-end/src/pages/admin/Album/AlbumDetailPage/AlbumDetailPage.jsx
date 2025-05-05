import { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";
import Select from "react-select";
import {
  Play,
  Pause,
  Calendar,
  Clock,
  Person,
  PersonCheck,
} from "react-bootstrap-icons";
import { toast } from "react-toastify";
import { getCookie } from "../../../../helpers/cookie";
import "./AlbumDetailPage.scss";
import {
  approve_album,
  get_album_by_id,
  reject_album,
} from "../../../../services/AlbumServices";
import { useParams, useNavigate } from "react-router-dom";
import ButtonWithModal from "../../../../components/ButtonWithModal/ButtonWithModal";

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

const getDeletedStatusLabel = (isDeleted) => {
  return isDeleted ? "Đã xóa" : "Chưa xóa";
};

const getDeletedStatusClass = (isDeleted) => {
  return isDeleted ? "status-red" : "status-green";
};

const getPremiumStatusLabel = (isPremiumOnly) => {
  return isPremiumOnly ? "Premium" : "Free";
};

const getPremiumStatusClass = (isPremiumOnly) => {
  return isPremiumOnly ? "status-purple" : "status-grey";
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
    return {
      ...styles,
      backgroundColor: state.isFocused ? `${color}20` : "transparent",
      color: color,
      padding: "10px",
      display: "flex",
      alignItems: "center",
      "&:hover": {
        backgroundColor: `${color}20`,
        color: color,
      },
    };
  },
};

function AlbumDetailPage({ managementPage = "albums" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [status, setStatus] = useState("pending");
  const [playingSongId, setPlayingSongId] = useState(null);
  const [fetchingStatus, setFetchingStatus] = useState({
    isLoading: true,
    isError: false,
  });
  const audioRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingStatus({ isLoading: true, isError: false });
        const response = await get_album_by_id(id);

        const formattedData = {
          id: response.data._id,
          title: response.data.title,
          artistName: response.data.singer.fullName,
          avatar: response.data.cover_image,
          approvedBy: response.data.approvedBy,
          createdBy: response.data.createdBy,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          status: response.data.status,
          isDeleted: response.data.deleted,
          songs: response.data.album_songs.map((song) => ({
            value: song._id,
            label: song.title,
            artist: song.singers.map((singer) => singer.singerName).join(", "),
            avatar: song.avatar,
            audio: song.audio,
            isPremiumOnly: song.isPremiumOnly,
          })),
        };
        setData(formattedData);
        setFetchingStatus({ isLoading: false, isError: false });
      } catch (error) {
        setFetchingStatus({ isLoading: false, isError: true });
        console.log("Check error", error);
      }
    };
    fetchData();
  }, [id]);

  const handleStatusChange = (selectedOption) => {
    setStatus(selectedOption.value);
  };

  const handleStatusConfirm = async () => {
    try {
      const account = JSON.parse(getCookie("account"));
      let response = null;
      switch (status) {
        case "rejected":
          response = await reject_album(data.id, account.id);
          break;

        default:
          response = await approve_album(data.id, account.id);
      }

      if (response.status === 200) {
        toast.success("Cập nhật trạng thái thành công");
      } else {
        toast.error("Cập nhật trạng thái thất bại");
      }
      navigate(`/admin/${managementPage}`, { replace: true });
    } catch (err) {
      console.error("Check err: ", err);
    }
  };

  const togglePlayPause = (songId, audioUrl) => {
    if (playingSongId === songId) {
      // Stop current song
      const audio = audioRefs.current[songId];
      if (!audio) return;

      audio.volume = 0.2;
      if (audio.src) {
        audio.pause();
        audio.currentTime = 0;
        setPlayingSongId(null);
      }
    } else {
      // Stop previous song if any
      if (playingSongId) {
        const prevAudio = audioRefs.current[playingSongId];
        if (prevAudio && prevAudio.src) {
          prevAudio.pause();
          prevAudio.currentTime = 0;
        }
      }
      // Play new song
      const audio = audioRefs.current[songId];
      if (!audio) return;

      audio.volume = 0.2;
      if (audio.src) {
        audio.play();
        setPlayingSongId(songId);

        // Add ended event listener
        audio.onended = () => {
          setPlayingSongId(null);
        };
      }
    }
  };

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
    <Container fluid className="album-detail">
      <Card className="album-detail-card">
        <Card.Header className="album-detail-header">
          <div className="d-flex justify-content-between align-items-start">
            <div style={{ flexBasis: "50%" }}>
              <h2 className="album-title">{data.title}</h2>
              <div className="album-id">ID: {data.id}</div>
            </div>
            <div
              className="d-flex flex-column align-items-end"
              style={{ flexBasis: "50%" }}
            >
              <div className="d-flex align-items-center action-section">
                {managementPage === "albums-approval" ? (
                  <>
                    <Select
                      classNamePrefix="react-select"
                      options={statusOptions}
                      styles={customStyles}
                      getOptionLabel={(e) => (
                        <div className={`status-badge ${e.className}`}>
                          {e.label}
                        </div>
                      )}
                      value={statusOptions.find(
                        (option) => option.value === status
                      )}
                      onChange={handleStatusChange}
                      getOptionValue={(e) => e.value}
                    />
                    <ButtonWithModal
                      type="button"
                      buttonLabel="Xác nhận"
                      buttonClassName="btn confirm-btn"
                      modalTitle="Xác nhận"
                      modalContent={
                        status === "rejected" ? (
                          <p>
                            Bạn có chắc chắn muốn từ chối album: {data.title} -{" "}
                            {data.id}?
                          </p>
                        ) : (
                          <p>
                            Bạn có chắc chắn muốn duyệt album: {data.title} -{" "}
                            {data.id}?
                          </p>
                        )
                      }
                      onSubmit={() => handleStatusConfirm()}
                      isDisabled={status === "pending"}
                    />
                  </>
                ) : (
                  <span>
                    Trạng thái duyệt:{" "}
                    <span
                      className={`status-badge mt-2 ${getStatusClass(
                        data.status
                      )}`}
                    >
                      {getStatusLabel(data.status)}
                    </span>
                  </span>
                )}
              </div>
              <span className="mt-3">
                Trạng thái xóa:{" "}
                <span
                  className={`status-badge ${getDeletedStatusClass(
                    data.isDeleted
                  )}`}
                >
                  {getDeletedStatusLabel(data.isDeleted)}
                </span>
              </span>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <Row className="mb-4">
            <Col md={4}>
              <div className="album-avatar">
                <img src={data.avatar} alt={data.title} />
              </div>
            </Col>
            <Col md={8}>
              <div className="album-info">
                <div className="info-group">
                  <h5>Tên album</h5>
                  <p>{data.title}</p>
                </div>
                <div className="info-group">
                  <h5>Ca sĩ</h5>
                  <p>{data.artistName}</p>
                </div>
              </div>
            </Col>
          </Row>

          <div className="songs-section">
            <h5>Songs</h5>
            {data.songs.map((song) => (
              <div key={song.value} className="song-item">
                <img
                  src={song.avatar}
                  alt={song.label}
                  className="song-avatar"
                />
                <div className="song-details">
                  <span className="song-title">{song.label}</span>
                  <span className="song-artist">{song.artist}</span>
                </div>
                <div className="song-status">
                  <span
                    className={`status-badge ${getPremiumStatusClass(
                      song.isPremiumOnly
                    )}`}
                  >
                    {getPremiumStatusLabel(song.isPremiumOnly)}
                  </span>
                </div>
                <Button
                  variant="link"
                  className="play-button"
                  onClick={() => togglePlayPause(song.value, song.audio)}
                >
                  {playingSongId === song.value ? (
                    <Pause size={24} />
                  ) : (
                    <Play size={24} />
                  )}
                </Button>
                <audio
                  ref={(el) => (audioRefs.current[song.value] = el)}
                  src={song.audio}
                />
              </div>
            ))}
          </div>

          <Row className="mt-4">
            <Col md={6}>
              <div className="timestamps">
                <div className="timestamp-item">
                  <Calendar className="icon" />
                  <span>Ngày tạo: {formatDate(data.createdAt)}</span>
                </div>
                <div className="timestamp-item">
                  <Clock className="icon" />
                  <span>Ngày cập nhật: {formatDate(data.updatedAt)}</span>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="timestamps justify-content-md-end">
                <div className="timestamp-item">
                  <Person className="icon" />
                  <span>Người tạo: {data.createdBy}</span>
                </div>
                <div className="timestamp-item">
                  <PersonCheck className="icon" />
                  <span>Người duyệt: {data.approvedBy || "Chưa duyệt"}</span>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AlbumDetailPage;

import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import {
  Upload,
  Trash,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
} from "react-bootstrap-icons";
import "./AlbumForm.scss";
import { create_album, update_album } from "../../services/AlbumServices";
import { toast } from "react-toastify";
import { getCookie } from "../../helpers/cookie";
import { useNavigate } from "react-router-dom";

const AlbumForm = ({ type, existingAlbum, listDataOption }) => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState("");
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [fetchStatus, setFetchStatus] = useState({
    isLoading: false,
    isError: false,
  });
  const audioRefs = useRef({});
  const imageInputRef = useRef(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      albumId: "ALB001", // This should be generated from the backend
      title: "",
      singerId: "",
      singerName: "",
      image: null,
      songs: [],
    },
  });

  useEffect(() => {
    const generateNewId = () => {
      const latestId = existingAlbum.albumId; // Replace with API call
      const newId = `ALB${String(parseInt(latestId.slice(3)) + 1).padStart(
        3,
        "0"
      )}`;
      return newId;
    };

    if (type === "update" && existingAlbum) {
      Object.keys(existingAlbum).forEach((key) => {
        setValue(key, existingAlbum[key]);
      });
      setImagePreview(existingAlbum.avatar);
      setSelectedSongs(existingAlbum.songs);

      // Set singerName based on singerId
      if (existingAlbum.singerId) {
        const selectedSinger = listDataOption.singers.find(
          (singer) => singer.value === existingAlbum.singerId
        );
        if (selectedSinger) {
          setValue("singerName", selectedSinger.fullName);
        }
      }
    } else {
      setValue("albumId", generateNewId());
    }
  }, [type, setValue, existingAlbum, listDataOption.singers]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file)); // For preview
      setImageFile(file); // Store the actual file object
    }
  };

  const handleImageRemove = (e) => {
    URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setImageFile(null);
    // Reset the input field
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleSongAdd = (selectedOption) => {
    if (
      selectedOption &&
      !selectedSongs.find((g) => g.value === selectedOption.value)
    ) {
      const newSong = {
        value: selectedOption.value,
        label: selectedOption.label,
        artist: selectedOption.artist,
        avatar: selectedOption.avatar,
        audio: selectedOption.audio,
        order: selectedSongs.length + 1,
      };
      setSelectedSongs([...selectedSongs, newSong]);
    }
  };

  const handleSongRemove = (value) => {
    setSelectedSongs(selectedSongs.filter((song) => song.value !== value));
  };

  const moveSong = (index, direction) => {
    const newSongs = [...selectedSongs];
    if (direction === "up" && index > 0) {
      [newSongs[index], newSongs[index - 1]] = [
        newSongs[index - 1],
        newSongs[index],
      ];
    } else if (direction === "down" && index < newSongs.length - 1) {
      [newSongs[index], newSongs[index + 1]] = [
        newSongs[index + 1],
        newSongs[index],
      ];
    }
    setSelectedSongs(newSongs);
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

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("albumId", data.albumId);
    formData.append("title", data.title);
    formData.append("singerId", data.singerId);
    formData.append("avatar", imageFile || existingAlbum.avatar);
    formData.append(
      "songs",
      JSON.stringify(selectedSongs.map((song) => song.value))
    );

    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const account = JSON.parse(getCookie("account"));
      if (!account) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
        return;
      }

      formData.append("accountId", account.id);
      formData.append("accountName", account.fullName);

      setFetchStatus({ isLoading: true, isError: false });
      let response;
      if (type === "update") {
        response = await update_album(data.albumId, formData);
      } else {
        response = await create_album(formData);
      }

      if (response.status !== 200) {
        toast.error(response.message);
        setFetchStatus({ isLoading: false, isError: true });
        return;
      }

      toast.success(response.message);
      navigate("/admin/albums", { replace: true });
      setFetchStatus({ isLoading: false, isError: false });
    } catch (error) {
      console.error("Error submitting form:", error);
      setFetchStatus({ isLoading: false, isError: true });
    }
  };

  if (fetchStatus.isLoading) {
    return (
      <div className="loading-overlay">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Xin vui lòng chờ đợi trong giây lát...</p>
      </div>
    );
  }

  return (
    <Container fluid className="management-container">
      <div className="management-form">
        <h2 className="management-header">
          {type === "update" ? "Cập nhật album" : "Thêm mới album"}
        </h2>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="songId">
                <Form.Label className="required">Mã album</Form.Label>
                <Form.Control
                  plaintext
                  readOnly
                  {...register("albumId")}
                  className="id-field"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="title">
                <Form.Label>Tên album</Form.Label>
                <Form.Control
                  {...register("title", { required: "Tên album là bắt buộc" })}
                  isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="singer">
                <Form.Label>Ca sĩ</Form.Label>
                <Controller
                  name="singerId"
                  control={control}
                  rules={{ required: "Ca sĩ là bắt buộc" }}
                  render={({ field }) => {
                    return (
                      <Select
                        {...field}
                        options={listDataOption.singers}
                        value={listDataOption.singers.find(
                          (option) => option.value === field.value
                        )}
                        onChange={(option) => {
                          console.log("Selected option on change:", option);
                          field.onChange(option.value);
                          setValue("singerName", option.fullName);
                        }}
                      />
                    );
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="singerName">
                <Form.Label>Tên ca sĩ</Form.Label>
                <Form.Control
                  readOnly
                  {...register("singerName")}
                  className="bg-light"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="avatar">
                <Form.Label>Ảnh bài hát</Form.Label>
                <div className="upload-button">
                  <Form.Control
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                  <label
                    htmlFor="avatar"
                    className="btn btn-outline-primary w-100"
                  >
                    <Upload className="me-2" />
                    Upload Image
                  </label>
                </div>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex justify-content-center">
              {imagePreview ? (
                <div className="preview-container mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="preview-image"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="remove-preview"
                    onClick={handleImageRemove}
                  >
                    <Trash />
                  </Button>
                </div>
              ) : (
                <div className="image-placeholder">Image Preview</div>
              )}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="songs">
                <Form.Label>Bài hát</Form.Label>
                <Select
                  options={listDataOption.songs.filter(
                    (opt) =>
                      !selectedSongs.find((item) => item.value === opt.value)
                  )}
                  onChange={handleSongAdd}
                  className="mb-3"
                />
                <div className="selected-songs">
                  {selectedSongs.map((song, index) => (
                    <div key={song.value} className="song-item">
                      <div className="song-info">
                        <img
                          src={song.avatar}
                          alt={song.label}
                          className="song-avatar"
                        />
                        <div className="song-details d-flex flex-column">
                          <span>{song.label}</span>
                          <span style={{ fontSize: "12.8px" }}>
                            {song.artist}
                          </span>
                        </div>
                        <Button
                          variant="link"
                          className="play-button"
                          onClick={() =>
                            togglePlayPause(song.value, song.audio)
                          }
                        >
                          {playingSongId === song.value ? <Pause /> : <Play />}
                        </Button>
                        <audio
                          ref={(el) => (audioRefs.current[song.value] = el)}
                          src={song.audio}
                        />
                      </div>
                      <div className="song-actions">
                        <Button
                          variant="link"
                          onClick={() => moveSong(index, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => moveSong(index, "down")}
                          disabled={index === selectedSongs.length - 1}
                        >
                          <ArrowDown />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger"
                          onClick={() => handleSongRemove(song.value)}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>
          <div className="d-grid">
            <Button type="submit" variant="primary" size="lg">
              {type === "update" ? "Cập nhật" : "Thêm mới"} album
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default AlbumForm;

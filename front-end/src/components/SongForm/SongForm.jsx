import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  ToastContainer,
  Spinner,
} from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Upload, Trash, Plus, X } from "react-bootstrap-icons";
import RelationshipSection from "../RelationshipSection/RelationshipSection";
import "./SongForm.scss";
import { Bounce, toast } from "react-toastify";
import { create_new_song, update_song_data } from "../../services/SongServices";

const SongForm = ({ type, existingSong, listDataOption }) => {
  const [imagePreview, setImagePreview] = useState("");
  const [audioPreview, setAudioPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [selectedSingers, setSelectedSingers] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [lyrics, setLyrics] = useState([
    { content: "", beginAt: "0", endAt: "" },
  ]);
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);

  let navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      songId: "",
      title: "",
      description: "",
      status: "pending",
      deleted: false,
      isPremiumOnly: false,
    },
  });

  // Load existing data for edit mode
  useEffect(() => {
    const generateNewId = () => {
      const latestId = existingSong.songId; // Replace with API call
      const newId = `SNG${String(parseInt(latestId.slice(3)) + 1).padStart(
        3,
        "0"
      )}`;
      return newId;
    };

    if (type === "update" && existingSong) {
      Object.keys(existingSong).forEach((key) => {
        setValue(key, existingSong[key]);
      });
      setImagePreview(existingSong.avatar);
      setAudioPreview(existingSong.audio);
      setVideoPreview(existingSong.video);
      setSelectedSingers(existingSong.singers || []);
      setSelectedTopics(existingSong.topics || []);
      setLyrics(
        existingSong.lyrics || [{ content: "", beginAt: "", endAt: "" }]
      );
    } else {
      setValue("songId", generateNewId());
    }
  }, [type, existingSong, setValue]);

  // Handle file changes
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

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioPreview(URL.createObjectURL(file)); // For preview
      setAudioFile(file); // Store the actual file object
    }
  };

  const handleAudioRemove = (e) => {
    URL.revokeObjectURL(audioPreview);
    setAudioPreview("");
    setAudioFile(null);
    // Reset the input field
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newPreview = URL.createObjectURL(file);
      setVideoPreview(newPreview); // Generate a new preview URL
      setVideoFile(file); // Store the actual file object
    }
  };

  // Add this function to handle video removal
  const handleVideoRemove = () => {
    URL.revokeObjectURL(videoPreview);
    setVideoPreview("");
    setVideoFile(null);
    // Reset the input field
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  // Handle lyrics
  const addLyricLine = () => {
    const lastLine = lyrics[lyrics.length - 1];
    setLyrics([
      ...lyrics,
      { content: "", beginAt: (+lastLine.endAt + 1).toString(), endAt: "" },
    ]);
  };

  const removeLyricLine = (index) => {
    setLyrics(lyrics.filter((_, i) => i !== index));
  };

  const updateLyricLine = (index, field, value) => {
    const newLyrics = [...lyrics];
    newLyrics[index][field] = value;
    setLyrics(newLyrics);
  };

  const validateLyrics = () => {
    const errors = [];
    lyrics.forEach((line, index) => {
      console.log(
        line.beginAt,
        line.endAt,
        typeof line.beginAt,
        typeof line.endAt
      );
      if (!line.content.trim()) {
        errors.push(`Dòng số ${index + 1} phải có lời bài hát`);
      }
      if (!line.beginAt || isNaN(line.beginAt) || +line.beginAt < 0) {
        errors.push(`Giây bắt đầu tại dòng số ${index + 1} phải là số dương`);
      }
      if (!line.endAt || isNaN(line.endAt) || +line.endAt <= +line.beginAt) {
        errors.push(
          `Giây kết thúc phải lớn hơn giây bắt đầu tại dòng số ${index + 1}`
        );
      }
    });
    return errors;
  };

  const onSubmit = async (data) => {
    if (selectedSingers.length === 0) {
      toast.error("Bài hát phải thuộc ít nhất 1 nghệ sĩ");
      return; // Stop submission if no singers are selected
    }

    const lyricErrors = validateLyrics();
    if (lyricErrors.length > 0) {
      lyricErrors.forEach((error) => toast.error(error));
      return;
    }

    const formData = new FormData();
    formData.append("songId", data.songId);
    formData.append("title", data.title);
    formData.append("avatar", imageFile); // Replace `avatarFile` with the selected image file

    if (!audioPreview) {
      toast.error("Vui lòng chọn file audio");
      return;
    }

    formData.append("audio", audioFile); // Replace `audioFile` with the selected audio file
    formData.append("video", videoFile); // Replace `videoFile` with the selected video file
    formData.append("description", data.description);
    formData.append(
      "singers",
      JSON.stringify(
        selectedSingers.map((singer) => ({
          singerId: singer.value,
          singerName: singer.label,
        }))
      )
    );
    formData.append(
      "lyrics",
      JSON.stringify(
        lyrics.map((sentence) => ({
          lyricContent: sentence.content,
          lyricStartTime: sentence.beginAt,
          lyricEndTime: sentence.endAt,
        }))
      )
    );
    formData.append(
      "topics",
      JSON.stringify(
        selectedTopics.map((topic) => ({
          topicId: topic.value,
          topicName: topic.label,
        }))
      )
    );
    formData.append("status", data.status);
    formData.append("deleted", data.deleted);
    formData.append("isPremiumOnly", data.isPremiumOnly);

    try {
      setIsSubmitting(true);
      let response = null;
      if (type === "create") {
        response = await create_new_song(formData);
        setIsSubmitting(false);
        toast.success("Thêm mới bài hát thành công!", response);
      } else {
        formData.set("avatar", imageFile || existingSong.avatar);
        formData.set("audio", audioFile || existingSong.audio);
        formData.set("video", videoFile || existingSong.video);
        
        response = await update_song_data(data.songId, formData);
        setIsSubmitting(false);
        toast.success("Cập nhật bài hát thành công!", response);
      }
      navigate("/admin/songs", { replace: true });
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  if (isSubmitting) {
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
          {type === "update" ? "Cập nhật bài hát" : "Thêm mới bài hát"}
        </h2>

        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="songId">
                <Form.Label className="required">Mã bài hát</Form.Label>
                <Form.Control
                  plaintext
                  readOnly
                  {...register("songId")}
                  className="id-field"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="title">
                <Form.Label className="required">Tên bài hát</Form.Label>
                <Form.Control
                  {...register("title", { required: "Title is required" })}
                  isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="isPremiumOnly">
                <Form.Label className="required">Trạng thái premium</Form.Label>
                <Form.Select {...register("isPremiumOnly")}>
                  <option value={false}>Miễn phí</option>
                  <option value={true}>Premium</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* File Upload Section */}
          <Row className="mb-5">
            {/* Avatar Upload */}
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
                {imagePreview && (
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
                )}
              </Form.Group>
            </Col>

            {/* Audio Upload */}
            <Col md={6}>
              <Form.Group controlId="audio">
                <Form.Label>File âm thanh</Form.Label>
                <div className="upload-button">
                  <Form.Control
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    hidden
                  />
                  <label
                    htmlFor="audio"
                    className="btn btn-outline-primary w-100"
                  >
                    <Upload className="me-2" />
                    Upload Audio
                  </label>
                </div>
                {audioPreview && (
                  <div className="audio-preview mt-3">
                    <audio controls src={audioPreview} className="w-100" />
                    <Button
                      variant="danger"
                      size="sm"
                      className="remove-preview"
                      onClick={handleAudioRemove}
                    >
                      <Trash />
                    </Button>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Video Upload */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="video">
                <Form.Label>File Video</Form.Label>
                <div className="upload-button">
                  <Form.Control
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    hidden
                  />
                  <label
                    htmlFor="video"
                    className="btn btn-outline-primary w-100"
                  >
                    <Upload className="me-2" />
                    Upload Video
                  </label>
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              {videoPreview && (
                <div className="video-preview mt-3">
                  <video
                    controls
                    className="preview-video"
                    src={videoPreview}
                    style={{ width: "100%", height: "100%" }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="remove-preview"
                    onClick={handleVideoRemove}
                  >
                    <Trash />
                  </Button>
                </div>
              )}
            </Col>
          </Row>

          {/* Description */}
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="description">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register("description")}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Relationships Section */}
          <Row className="mb-3">
            <Col md={6}>
              <RelationshipSection
                title="Singers"
                options={listDataOption.singers}
                selectedItems={selectedSingers}
                onAddItem={(item) =>
                  setSelectedSingers([...selectedSingers, item])
                }
                onRemoveItem={(value) =>
                  setSelectedSingers(
                    selectedSingers.filter((s) => s.value !== value)
                  )
                }
              />
            </Col>

            <Col md={6}>
              <RelationshipSection
                title="Topics"
                options={listDataOption.topics}
                selectedItems={selectedTopics}
                onAddItem={(item) =>
                  setSelectedTopics([...selectedTopics, item])
                }
                onRemoveItem={(value) =>
                  setSelectedTopics(
                    selectedTopics.filter((t) => t.value !== value)
                  )
                }
              />
            </Col>
          </Row>

          {/* Lyrics Section */}
          <Row className="mb-3">
            <Col md={12}>
              <div className="lyrics-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Form.Label>Lời bài hát</Form.Label>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={addLyricLine}
                  >
                    <Plus /> Thêm dòng
                  </Button>
                </div>
                {lyrics.map((line, index) => (
                  <div key={index} className="lyric-line mb-3">
                    <Row>
                      <Col md={6}>
                        <Form.Control
                          placeholder="Lyric content"
                          value={line.content}
                          onChange={(e) =>
                            updateLyricLine(index, "content", e.target.value)
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Control
                          type="number"
                          placeholder="Start at (s)"
                          value={line.beginAt}
                          onChange={(e) =>
                            updateLyricLine(index, "beginAt", e.target.value)
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Control
                          type="number"
                          placeholder="End at (s)"
                          value={line.endAt}
                          onChange={(e) =>
                            updateLyricLine(index, "endAt", e.target.value)
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Button
                          variant="outline-danger"
                          onClick={() => removeLyricLine(index)}
                          disabled={lyrics.length === 1}
                        >
                          <X />
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Col>
          </Row>

          {type === "update" && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="deleted">
                  <Form.Label>Deletion Status</Form.Label>
                  <Form.Select {...register("deleted")}>
                    <option value={false}>Not Deleted</option>
                    <option value={true}>Deleted</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* Submit Button */}
          <div className="d-grid">
            <Button type="submit" variant="primary" size="lg">
              {type === "update" ? "Cập nhật" : "Thêm mới"} bài hát
            </Button>
          </div>
        </Form>
      </div>
      <ToastContainer
        position="top-right"
        autoclose={5000}
        hideprogressbar="false"
        newestontop="false"
        closeonclick="false"
        rtl="false"
        pauseonfocusloss="true"
        draggable
        pauseonhover="true"
        theme="light"
        transition={Bounce}
      />
    </Container>
  );
};

export default SongForm;

import { useState, useRef } from "react";
import { create_topic } from "../../../services/TopicServices";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import "./create.css";
import { toast, Bounce } from "react-toastify";

export default function CreateTopic({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const formRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setAvatarFile(file);
    } else {
      setImagePreview(null);
      setAvatarFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const topicData = Object.fromEntries(formData.entries());
    console.log(topicData);

    try {
      let avatarUrl = null;

      if (avatarFile) {
        avatarUrl = await uploadToCloudinary(avatarFile);
        if (!avatarUrl) {
          toast.error("Lỗi khi tải ảnh lên Cloudinary!", {
            transition: Bounce,
          });
          return;
        }
      }

      const newTopic = {
        title: topicData.title,
        avatar: avatarUrl,
        description: topicData.description,
        status: topicData.status || "active",
      };
      console.log("newTopic gửi lên server:", newTopic);

      const result = await create_topic(newTopic);
      if (result && !result.error) {
        toast.success("Tạo chủ đề thành công!", { transition: Bounce });
        formRef.current.reset();
        setImagePreview(null);
        setAvatarFile(null);
        onClose();
      } else {
        toast.error(result?.error || "Lỗi khi tạo chủ đề!", {
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo chủ đề:", error);
      toast.error("Lỗi khi tạo chủ đề!", { transition: Bounce });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Thêm chủ đề mới</h2>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="topic__form topic__form-flex"
        >
          {/* CỘT TRÁI: ẢNH */}
          <div className="topic__form-left">
            {imagePreview && (
              <img
                src={imagePreview}
                className="topic__avatar-preview"
                alt="Avatar Preview"
              />
            )}
            <label className="topic__file-label">
              Chọn ảnh:
              <input
                type="file"
                // title="avatar"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* CỘT PHẢI: INPUTS */}
          <div className="topic__form-right">
            <label>
              Tên chủ đề:
              <input type="text" name="title" required />
            </label>

            <label>
              Mô tả:
              <textarea name="description" />
            </label>

            <label>
              Trạng thái:
              <select name="status" defaultValue="active">
                <option value="active">Hiển thị</option>
                <option value="inactive">Ẩn</option>
              </select>
            </label>

            <div className="modal-actions">
              <button type="submit" className="topic__btn topic__btn-add">
                Lưu
              </button>
              <button
                type="button"
                onClick={onClose}
                className="topic__btn topic__btn-cancel"
              >
                Hủy
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}



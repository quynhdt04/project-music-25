import { useState, useRef } from "react";
import { create_topic } from "../../../services/TopicServices";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import "./create.css";
import { toast, Bounce } from "react-toastify";
import Swal from "sweetalert2";
import { patch_topic } from "../../../services/TopicServices"; // Đường dẫn đúng

export default function CreateTopic({ onClose, onAddTopic, onUpdateTopic }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const formRef = useRef(null);
  const [title, setTitle] = useState("");
  const [avatar, setAvatar] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [isEdit, setIsEdit] = useState(false);
  const [editTopicData, setEditTopicData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(false);
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

    // Kiểm tra các trường có rỗng không
    if (!title || !description || (!avatar && !avatarFile)) {
      toast.error("Tất cả các trường đều phải được điền đầy đủ!");
      return;
    }

    try {
      let avatarUrl = avatar; // Dùng ảnh cũ mặc định
      if (avatarFile) {
        avatarUrl = await uploadToCloudinary(avatarFile);
        if (!avatarUrl) {
          toast.error("Lỗi khi tải ảnh lên Cloudinary!", {
            transition: Bounce,
          });
          return;
        }
      }

      const topicData = {
        title,
        avatar: avatarUrl,
        description,
        status,
      };

      let result = null;

      if (isEdit && editTopicData?.id) {
        // Sửa chủ đề
        result = await patch_topic(editTopicData.id, topicData);
      } else {
        // Tạo mới chủ đề
        result = await create_topic(topicData);
      }

      if (result && !result.error) {
        toast.success(
          isEdit ? "Cập nhật chủ đề thành công!" : "Tạo chủ đề thành công!",
          {
            transition: Bounce,
          }
        );

        if (formRef.current) {
          formRef.current.reset();
        }
        setImagePreview(null);
        setAvatarFile(null);
        setTitle("");
        setDescription("");
        setStatus("active");

        onClose();
        if (isEdit) {
          onUpdateTopic(result); // Cập nhật danh sách với topic đã sửa
        } else {
          onAddTopic(result); // Thêm vào danh sách topic mới
        }
      } else {
        toast.error(result?.error || "Có lỗi xảy ra!", { transition: Bounce });
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Lỗi trong quá trình xử lý!", { transition: Bounce });
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
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* CỘT PHẢI: INPUTS */}
          <div className="topic__form-right">
            <label>
              Tên chủ đề:
              <input
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label>
              Mô tả:
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label>
              Trạng thái:
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
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

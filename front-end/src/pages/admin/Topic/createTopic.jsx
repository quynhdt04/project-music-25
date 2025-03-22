import { useState, useRef } from "react";
import { create_topic } from "../../../services/TopicServices";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import "./create.css";
import { toast, Bounce } from "react-toastify";

export default function CreateTopic({ onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const formRef = useRef(null);
  const [title, setTitle] = useState("");
  const [avatar, setAvatar] = useState("");
  const [description, setDescription] = useState("");

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
    if (!title || !avatarFile || !description) {
      toast.error("Tất cả các trường đều phải được điền đầy đủ!");
      return;
    }

    try {
      let avatarUrl = null;

      // Nếu có file ảnh, tải lên Cloudinary
      if (avatarFile) {
        avatarUrl = await uploadToCloudinary(avatarFile);
        if (!avatarUrl) {
          toast.error("Lỗi khi tải ảnh lên Cloudinary!", {
            transition: Bounce,
          });
          return;
        }
      }

      // Tạo dữ liệu chủ đề
      const newTopic = {
        title,
        avatar: avatarUrl || avatar,  // Nếu không có ảnh mới, dùng ảnh cũ
        description,
        status: "active", // Mặc định là hiển thị
      };

      // Gửi dữ liệu lên server
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

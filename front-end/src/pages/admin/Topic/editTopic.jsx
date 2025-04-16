import { useEffect, useState } from "react";
import { get_topic_by_id, update_topic } from "../../../services/TopicServices";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import "./edit.css";
import { toast, Bounce } from "react-toastify";

function EditTopic({ topicId, onClose, readOnly = false , onUpdateTopic}) {
  const [formData, setFormData] = useState({
    title: "",
    avatar: "",
    description: "",
    status: "active",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await get_topic_by_id(topicId); // lấy dữ liệu
        const topic = response.topic; // ✅ giải nén dữ liệu topic
        setFormData({
          title: topic.title || "",
          avatar: topic.avatar || "",
          description: topic.description || "",
          status: topic.status || "active",
        });
        setImagePreview(topic.avatar || null);
      } catch (error) {
        console.error("Lỗi khi lấy chủ đề:", error);
        toast.error("Không thể tải dữ liệu chủ đề.", { transition: Bounce });
      }
    };

    fetchTopic();
  }, [topicId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Hiển thị preview từ file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    // Kiểm tra các trường có rỗng không
    if (!formData.title || !formData.description || !formData.avatar && !avatarFile) {
      toast.error("Tất cả các trường đều phải được điền đầy đủ!");
      return;
    }

    try {
      let avatarUrl = formData.avatar;

      // Nếu có file ảnh mới, tải lên Cloudinary
      if (avatarFile) {
        const uploadedUrl = await uploadToCloudinary(avatarFile);
        if (!uploadedUrl) {
          toast.error("Lỗi khi tải ảnh lên Cloudinary!", {
            transition: Bounce,
          });
          return;
        }
        avatarUrl = uploadedUrl;
      }

      const updatedTopic = {
        title: formData.title,
        avatar: avatarUrl,
        description: formData.description,
        status: formData.status,
      };

      const result = await update_topic(topicId, updatedTopic);
      if (result.message && result.topic) 
      {
        onUpdateTopic(result.topic);
      //   toast.success("Cập nhật chủ đề thành công!", { transition: Bounce });
        onClose();}
      // } else {
      //   toast.error(result.error || "Lỗi khi cập nhật chủ đề!", {
      //     transition: Bounce,
      //   });
      // }
    } catch (error) {
      console.error("Lỗi khi cập nhật chủ đề:", error);
      toast.error("Lỗi khi cập nhật chủ đề!", { transition: Bounce });
    }
  };

  return (
    <div className="modal-overlay .topic-modal">
      <div className="modal-content">
        <h2>{readOnly ? "Chi tiết chủ đề" : "Chỉnh sửa chủ đề"}</h2>
        <form onSubmit={handleSubmit} className="topic__form topic__form-flex">
          {/* CỘT TRÁI: ẢNH */}
          <div className="topic__form-left">
            {(avatarPreview || formData.avatar) && (
              <img
                src={avatarPreview || formData.avatar}
                alt="Ảnh chủ đề"
                className="topic__avatar-preview"
              />
            )}

            {!readOnly && (
              <label className="topic__file-label">
                Chọn ảnh mới:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* CỘT PHẢI: INPUTS */}
          <div className="topic__form-right">
            <label>
              Tên chủ đề:
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={readOnly}
                required
              />
            </label>

            <label>
              Mô tả:
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={readOnly}
              />
            </label>

            <label>
              Trạng thái:
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={readOnly}
              >
                <option value="active">Hiển thị</option>
                <option value="inactive">Ẩn</option>
              </select>
            </label>

            <div className="modal-actions">
              {!readOnly && (
                <button type="submit" className="topic__btn topic__btn-add">
                  Cập nhật
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="topic__btn topic__btn-cancel"
              >
                {readOnly ? "Đóng" : "Hủy"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTopic;

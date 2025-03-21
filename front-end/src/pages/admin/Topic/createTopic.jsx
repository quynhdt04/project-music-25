import BoxHead from "../../../components/BoxHead";
import { useEffect, useRef, useState } from "react";
import { create_topic } from "../../../services/TopicServices";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import { useNavigate } from "react-router-dom";
import { toast, Bounce } from "react-toastify";

function CreateTopic() {
    const [imagePreview, setImagePreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const formRef = useRef(null);
    const navigate = useNavigate();

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

        try {
            let avatarUrl = null;
            if (avatarFile) {
                avatarUrl = await uploadToCloudinary(avatarFile);
                if (!avatarUrl) {
                    toast.error("Lỗi khi tải ảnh lên Cloudinary!", { transition: Bounce });
                    return;
                }
            }

            const newTopic = {
                ...topicData,
                avatar: avatarUrl,
                slug: topicData.slug.toLowerCase().replace(/\s+/g, '-'),
            };

            const result = await create_topic(newTopic);

            if (result.message) {
                toast.success('Tạo chủ đề thành công!', { transition: Bounce });
                formRef.current.reset();
                setImagePreview(null);
                setAvatarFile(null);
                navigate(-1);
            } else {
                toast.error(result.error, { transition: Bounce });
            }

        } catch (error) {
            console.error("Lỗi khi tạo chủ đề:", error);
            toast.error('Lỗi khi tạo chủ đề!', { transition: Bounce });
        }
    };

    return (
        <>
            <BoxHead title="Tạo chủ đề mới" />
            <form ref={formRef} onSubmit={handleSubmit} method="POST" className="create-account-form">
                <div className="create-account-group">
                    <label htmlFor="title" className="create-account-label">Tiêu đề *</label>
                    <input type="text" className="create-account-input" id="title" name="title" required />
                </div>

                <div className="create-account-group">
                    <label htmlFor="slug" className="create-account-label">Slug *</label>
                    <input type="text" className="create-account-input" id="slug" name="slug" required />
                </div>

                <div className="create-account-group">
                    <label htmlFor="description" className="create-account-label">Mô tả</label>
                    <textarea className="create-account-input" id="description" name="description" rows="4" />
                </div>

                <div className="create-account-group">
                    <label htmlFor="avatar" className="create-account-label">Ảnh đại diện</label>
                    <input type="file" className="create-account-input" id="avatar" name="avatar" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && (
                        <img src={imagePreview} className="create-account-avatar-preview" alt="Avatar Preview" />
                    )}
                </div>

                <div className="create-account-group create-account-status-container">
                    <label className="create-account-label">Trạng thái</label>
                    <div className="create-account-status-options">
                        <label className="create-account-status-item">
                            <input type="radio" className="create-account-status-input" id="statusActive" name="status" value="active" defaultChecked />
                            <span>Hoạt động</span>
                        </label>
                        <label className="create-account-status-item">
                            <input type="radio" className="create-account-status-input" id="statusInactive" name="status" value="inactive" />
                            <span>Ngừng hoạt động</span>
                        </label>
                    </div>
                </div>

                <button type="submit" className="create-account-submit-btn">Tạo mới</button>
            </form>
        </>
    );
}

export default CreateTopic;

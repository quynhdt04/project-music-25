import BoxHead from "../../../components/BoxHead";
import { useEffect, useRef, useState } from "react";
import { create_user } from "../../../services/UserServices";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import { useNavigate } from "react-router-dom"; // dùng để chuyển trang
import { toast, Bounce } from "react-toastify";

function CreateUser() {
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
        const userData = Object.fromEntries(formData.entries()); //json
        try {
            let avatarUrl = null;

            if (avatarFile) {
                avatarUrl = await uploadToCloudinary(avatarFile);
                if (!avatarUrl) {
                    alert("Lỗi khi tải ảnh lên Cloudinary!");
                    return;
                }
            }
            const newUser = { ...userData, avatar: avatarUrl }; //json
            console.log(newUser);

            const result = await create_user(newUser);
            console.log(result); // Kiểm tra phản hồi từ server
            if (result.message) {
                toast.success('Tạo người dùng thành công!', { transition: Bounce });
                formRef.current.reset();
                setImagePreview(null);
                setAvatarFile(null);
                navigate(-1);
            } else {
                toast.error(result.error, { transition: Bounce });
            }
        } catch (error) {
            console.error("Lỗi khi tạo người dùng:", error);
            toast.error('Lỗi khi tạo người dùng!', { transition: Bounce });
        }
    };


    return (
        <>
            <BoxHead title="Tạo người dùng mới" />
            <form ref={formRef} onSubmit={handleSubmit} method="POST" className="from-user">
                <div className="from-user__group">
                    <label htmlFor="avatar">Ảnh đại diện</label>
                    <input type="file" id="avatar" name="avatar" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && (
                        <img src={imagePreview} className="create-user-avatar-preview" alt="Avatar Preview" />
                    )}
                </div>
                <div className="from-user__group">
                    <label htmlFor="fullName">Họ tên *</label>
                    <input type="text" id="fullName" name="fullName" required />
                </div>
                <div className="from-user__group">
                    <label htmlFor="email">Email *</label>
                    <input type="text" id="email" name="email" required />
                </div>
                <div className="from-user__group">
                    <label htmlFor="phone">Số điện thoại *</label>
                    <input type="text" id="phone" name="phone" required />
                </div>
                <div className="from-user__group">
                    <label htmlFor="password">Mật khẩu *</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <div className="from-user__box">
                    <label>Trạng thái</label>
                    <div className="from-user__status">
                        <label className="from-user__item">
                            <input type="radio" id="statusActive" name="status" value="active" defaultChecked />
                            <span>Hoạt động</span>
                        </label>
                        <label className="from-user__item">
                            <input type="radio" id="statusInactive" name="status" value="inactive" />
                            <span>Ngừng hoạt động</span>
                        </label>
                    </div>
                </div>
                <div className="from-user__btn">
                    <button
                        type="button"
                        className="btn-back btn"
                        onClick={() => navigate(-1)}
                    >
                        Trở lại
                    </button>
                    <button type="submit" className="btn btn-create">Tạo mới</button>
                </div>
            </form>
        </>
    )
}
export default CreateUser;
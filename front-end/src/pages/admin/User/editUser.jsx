import BoxHead from "../../../components/BoxHead";
import { useEffect, useRef, useState } from "react";
import { patch_user, get_user_by_id } from "../../../services/UserServices";

import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Bounce } from "react-toastify";

function EditUser() {
    const [imagePreview, setImagePreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const formRef = useRef(null);
    const navigate = useNavigate();
    const { id: userId } = useParams();

    const [userData, setUserData] = useState({
        fullName: "",
        avatar: "",
        status: "active",
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await get_user_by_id(userId);
                console.log("API response:", response); // Kiểm tra dữ liệu trả về

                if (response && response.user) {
                    console.log("API response:", response);
                    setUserData(response.user);
                    setImagePreview(response.user.avatar || null);
                } else {
                    console.error("Không tìm thấy thông tin người dùng!");
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };
        fetchUser();
    }, [userId]);

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
        const updatedUserData = Object.fromEntries(formData.entries());

        try {
            let avatarUrl = userData.avatar;

            if (avatarFile) {
                avatarUrl = await uploadToCloudinary(avatarFile);
                if (!avatarUrl) {
                    alert("Lỗi khi tải ảnh lên Cloudinary!");
                    return;
                }
            }
            const updatedUser = { ...updatedUserData, avatar: avatarUrl };

            const result = await patch_user(userId, updatedUser);
            if (result.message) {
                toast.success('Cập nhật người dùng thành công!', { transition: Bounce });
                navigate(-1);
            } else {
                toast.error(result.error, { transition: Bounce });
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật người dùng:", error);
            toast.error('Lỗi khi cập nhật người dùng!', { transition: Bounce });
        }
    };

    const handleStatusChange = (e) => {
        setUserData((prev) => ({ ...prev, status: e.target.value }));
    };

    return (
        <>
            <BoxHead title="Sửa người dùng" />
            <form ref={formRef} onSubmit={handleSubmit} method="POST" className="from-user">
                <div className="from-user__group">
                    <label htmlFor="fullName">Họ tên *</label>
                    <input type="text" id="fullName" name="fullName" value={userData.fullName} readOnly />
                </div>
                <div className="from-user__group">
                    <label htmlFor="avatar">Ảnh đại diện</label>
                    <input type="file" id="avatar" name="avatar" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && (
                        <img src={imagePreview} className="create-user-avatar-preview" alt="Avatar Preview" />
                    )}
                </div>
                <div className="from-user__box">
                    <label>Trạng thái</label>
                    <div className="from-user__status">
                        <label className="from-user__item">
                            <input type="radio" id="statusActive" name="status" value="active" checked={userData.status === "active"} onChange={handleStatusChange} />
                            <span>Hoạt động</span>
                        </label>
                        <label className="from-user__item">
                            <input type="radio" id="statusInactive" name="status" value="inactive" checked={userData.status === "inactive"} onChange={handleStatusChange} />
                            <span>Ngừng hoạt động</span>
                        </label>
                    </div>
                </div>
                <div className="from-user__btn">
                    <button
                        type="button"
                        className="btn-back btn"
                        onClick={() => navigate(-1)}>
                        Trở lại
                    </button>
                    <button type="submit" className="btn btn-create">Cập nhật</button>
                </div>
            </form>
        </>
    );
}

export default EditUser;

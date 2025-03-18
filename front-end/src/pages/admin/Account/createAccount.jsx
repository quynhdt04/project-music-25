import BoxHead from "../../../components/BoxHead";
import { useEffect, useRef, useState } from "react";
import { create_account } from "../../../services/AccountServices";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import { get_all_roles } from "../../../services/RoleServices";
import { useNavigate } from "react-router-dom";
import { toast, Bounce } from "react-toastify";

function CreateAccount() {

    const [imagePreview, setImagePreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const formRef = useRef(null);
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

    useEffect(() =>{
        const fetchAPI = async() => {
            const result = await get_all_roles();
            setRoles(result.roles);
        } 
        fetchAPI();
    },[])

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
        const accountData = Object.fromEntries(formData.entries());
        try {
            let avatarUrl = null;

            if (avatarFile) {
                avatarUrl = await uploadToCloudinary(avatarFile);
                if (!avatarUrl) {
                    alert("Lỗi khi tải ảnh lên Cloudinary!");
                    return;
                }
            }
            const newAccount = { ...accountData, avatar: avatarUrl };
            console.log(newAccount);
            
            const result = await create_account(newAccount);
            if(result.message) {
                toast.success('Tạo tài khoản thành công!', { transition: Bounce });
                formRef.current.reset();
                setImagePreview(null);
                setAvatarFile(null);
                navigate(-1);
            }else {
                toast.error(result.error, { transition: Bounce });
            }
        }catch (error) {
            console.error("Lỗi khi tạo tài khoản:", error);
            toast.error('Lỗi khi tạo tài khoản!', { transition: Bounce });
        }
    };


    return (
        <>
            <BoxHead title="Tạo tài khoản mới" />
            <form ref={formRef} onSubmit={handleSubmit} method="POST" className="create-account-form">
                <div className="create-account-group">
                    <label htmlFor="fullName" className="create-account-label">Họ tên *</label>
                    <input type="text" className="create-account-input" id="fullName" name="fullName" required />
                </div>

                <div className="create-account-group">
                    <label htmlFor="email" className="create-account-label">Email *</label>
                    <input type="email" className="create-account-input" id="email" name="email" required />
                </div>

                <div className="create-account-group">
                    <label htmlFor="password" className="create-account-label">Mật khẩu *</label>
                    <input type="password" className="create-account-input" id="password" name="password" required />
                </div>

                <div className="create-account-group">
                    <label htmlFor="phone" className="create-account-label">Số điện thoại</label>
                    <input type="tel" className="create-account-input" id="phone" name="phone" />
                </div>

                <div className="create-account-group">
                    <label htmlFor="avatar" className="create-account-label">Ảnh đại diện</label>
                    <input type="file" className="create-account-input" id="avatar" name="avatar" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && (
                        <img src={imagePreview} className="create-account-avatar-preview" alt="Avatar Preview" />
                    )}
                </div>

                <div className="create-account-group">
                    <label htmlFor="role_id" className="create-account-label">Phân quyền</label>
                    <select name="role_id" id="role_id" className="create-account-input" defaultValue="">
                        <option value="" disabled>--Chọn--</option>
                        {roles.map(item => (
                            <option key={item.id} value={item.id}>{item.title}</option>
                        ))}
                    </select>
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
    )
}

export default CreateAccount;
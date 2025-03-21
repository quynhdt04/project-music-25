import { useState } from "react";
import "./InfoUser.scss";
import { useDispatch, useSelector } from "react-redux";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import { toast, Bounce } from "react-toastify";
import { patch_account } from "../../../services/AccountServices";
import { setAuthUpdateAccount } from "../../../actions/authen";

function InfoUser() {
    const role = useSelector((state) => state.authenReducer.role);
    const account = useSelector((state) => state.authenReducer.account);
    const [imagePreview, setImagePreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const dispatch = useDispatch();

    const [data, setData] = useState({
        avatar: "",
        fullName: "",
        password: "",
        phone: ""
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setAvatarFile(file);
        } else {
            setImagePreview(null);
            setAvatarFile(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let avatarUrl = data.avatar;
    
        // Nếu có ảnh mới thì upload lên Cloudinary
        if (avatarFile) {
            avatarUrl = await uploadToCloudinary(avatarFile);
            if (!avatarUrl) {
                toast.error("Lỗi khi tải ảnh lên", { transition: Bounce });
                return;
            }
        }
    
        // Tạo biến tạm chứa giá trị mới
        const updatedData = { ...data, avatar: avatarUrl };
        setData(updatedData);
    
        // Thêm avatarUrl vào filteredData nếu ảnh mới được upload
        const filteredData = Object.keys(updatedData).reduce((acc, key) => {
            if (updatedData[key] !== "" && updatedData[key] !== null) {
                acc[key] = updatedData[key];
            }
            return acc;
        }, {});
    
    
        if (Object.keys(filteredData).length === 0) {
            toast.info("Không có dữ liệu thay đổi!", { transition: Bounce });
            return;
        }
    
        const result = await patch_account(account.id, filteredData);
        if (result.message) {
            toast.success("Cập nhật tài khoản thành công", { transition: Bounce });
            const updatedAccount = { ...account, ...filteredData };
            dispatch(setAuthUpdateAccount(updatedAccount));
        } else {
            toast.error(result.error, { transition: Bounce });
        }
    };

    return (
        <>
            <div className="info-user">
                <div className="info-user__image">
                    <img src={imagePreview || account.avatar} alt="Avatar" />
                    <input
                        type="file"
                        className="info-user__avatar"
                        id="avatar" name="avatar"
                        accept="image/*"
                        onChange={handleImageChange} />
                </div>
                <div className="info-user__form">
                    <form onSubmit={handleSubmit}>

                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            readOnly
                            defaultValue={account.email || ""} />

                        <label>Họ và tên</label>
                        <input
                            name="fullName"
                            type="text"
                            placeholder="Họ và tên"
                            defaultValue={account.fullName || ""}
                            onChange={(e) => setData(prev => ({ ...prev, fullName: e.target.value }))} />

                        <label>Số điện thoại</label>
                        <input
                            type="text"
                            placeholder="Số điện thoại"
                            name="phone"
                            defaultValue={account.phone}
                            onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))} />

                        <label>Quyền</label>
                        <input
                            type="text"
                            placeholder="Quyền"
                            readOnly
                            defaultValue={role.title} />

                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            name="password"
                            onChange={(e) => setData(prev => ({ ...prev, password: e.target.value }))} />

                        <div className="info-user__btn">
                            <button type="submit" className="btn update">Cập nhật</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default InfoUser;
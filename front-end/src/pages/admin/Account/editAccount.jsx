import BoxHead from "../../../components/BoxHead";
import { useEffect, useRef, useState } from "react";
import { get_account_by_id, patch_account } from "../../../services/AccountServices";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Bounce } from "react-toastify";


function EditAccount() {

    const [imagePreview, setImagePreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    const [data, setData] = useState({
        fullName: "",
        password: "",
        phone: "",
        avatar: "",
        status: ""
    });

    const formRef = useRef(null);
    const [account, setAccount] = useState([]);
    const navigate = useNavigate();
    const param = useParams();

    useEffect(() => {
        const fetchAPI = async () => {
            const resultAccount = await get_account_by_id(param.id);
            console.log(resultAccount);
            setAccount(resultAccount.account);
            setImagePreview(resultAccount.account.avatar)
        }
        fetchAPI();
    }, []);

    useEffect(() => {
        if (account) {
            setData({
                fullName: account.fullName || "",
                password: "",
                phone: account.phone || "",
                avatar: account.avatar || "",
                status: account.status || ""
            });
        }
    }, [account]);

    const handleStatusChange = (event) => {
        setData((prev) => ({
            ...prev,
            status: event.target.value
        }));
    };


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

        let avatarUrl = data.avatar; 

        if (avatarFile) {
            avatarUrl = await uploadToCloudinary(avatarFile);
            if (!avatarUrl) {
                toast.error("Lỗi khi tải ảnh lên!", { transition: Bounce });
                return;
            }
        }

        const updatedData = { ...data, avatar: avatarUrl };
        const result = await patch_account(param.id, updatedData);

        if (result.message) {
            toast.success("Cập nhật tài khoản thành công", { transition: Bounce });
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } else {
            toast.error(result.error, { transition: Bounce });
        }
    };


    return (
        <>
            <BoxHead title="Chỉnh sửa tài khoản" />
            <form onSubmit={handleSubmit} method="POST" className="from-account">
                <div className="from-account__group">
                    <label htmlFor="fullName">Họ tên *</label>
                    <input
                        type="text"
                        id="fullName" name="fullName"
                        required
                        defaultValue={account.fullName || ""}
                        onChange={(e) => setData(prev => ({ ...prev, fullName: e.target.value }))} />
                </div>

                <div className="from-account__group">
                    <label htmlFor="password">Mật khẩu *</label>
                    <input
                        type="password"
                        className="create-account-input"
                        id="password"
                        name="password"
                        onChange={(e) => setData(prev => ({ ...prev, password: e.target.value }))} />
                </div>

                <div className="from-account__group">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        defaultValue={account.phone || ""}
                        onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))} />
                </div>

                <div className="from-account__group">
                    <label htmlFor="avatar">Ảnh đại diện</label>
                    <input
                        type="file"
                        id="avatar" name="avatar"
                        accept="image/*"
                        onChange={handleImageChange} />
                    {imagePreview && (
                        <img src={imagePreview} alt="Avatar Preview" />
                    )}
                </div>

                <div className="from-account__box">
                    <label>Trạng thái</label>
                    <div className="from-account__status">
                        <label className="from-account__item">
                            <input
                                type="radio"
                                id="statusActive"
                                name="status"
                                value="active"
                                checked={data.status === "active"}
                                onChange={handleStatusChange} />
                            <span>Hoạt động</span>
                        </label>
                        <label className="from-account__item">
                            <input
                                type="radio"
                                id="statusInactive"
                                name="status"
                                value="inactive"
                                checked={data.status === "inactive"}
                                onChange={handleStatusChange} />
                            <span>Ngừng hoạt động</span>
                        </label>
                    </div>
                </div>

                <div className="from-account__btn">
                    <button
                        type="button"
                        className="btn-back btn"
                        onClick={() => navigate(-1)}
                    >
                        Trở lại
                    </button>
                    <button type="submit" className="btn btn-create">Cập nhật</button>
                </div>
            </form>
        </>
    )
}

export default EditAccount;
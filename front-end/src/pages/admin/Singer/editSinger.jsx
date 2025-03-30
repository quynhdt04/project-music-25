import BoxHead from "../../../components/BoxHead";
import { useEffect, useRef, useState } from "react";
import { patch_singer, get_singer_by_id } from "../../../services/SingerServices";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Bounce } from "react-toastify";

function EditSinger() {
    const [imagePreview, setImagePreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const formRef = useRef(null);
    const navigate = useNavigate();
    const { id: singerId } = useParams();

    const [singerData, setSingerData] = useState({
        fullName: "",
        avatar: "",
        status: "active",
    });

    useEffect(() => {
        const fetchSinger = async () => {
            try {
              const response = await get_singer_by_id(singerId);
              console.log("API response:", response); // Kiểm tra dữ liệu trả về
          
              if (response && response.singer) {
                console.log("API response:", response);
                setSingerData(response.singer);
                setImagePreview(response.singer.avatar || null);
              } else {
                console.error("Không tìm thấy thông tin ca sĩ!");
              }
            } catch (error) {
              console.error("Lỗi khi lấy thông tin ca sĩ:", error);
            }
          };          
        fetchSinger();
    }, [singerId]);

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
        const updatedSingerData = Object.fromEntries(formData.entries());
        
        try {
            let avatarUrl = singerData.avatar;

            if (avatarFile) {
                avatarUrl = await uploadToCloudinary(avatarFile);
                if (!avatarUrl) {
                    alert("Lỗi khi tải ảnh lên Cloudinary!");
                    return;
                }
            }
            const updatedSinger = { ...updatedSingerData, avatar: avatarUrl };

            const result = await patch_singer(singerId, updatedSinger);
            if (result.message) {
                toast.success('Cập nhật ca sĩ thành công!', { transition: Bounce });
                navigate(-1);
            } else {
                toast.error(result.error, { transition: Bounce });
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật ca sĩ:", error);
            toast.error('Lỗi khi cập nhật ca sĩ!', { transition: Bounce });
        }
    };

    const handleStatusChange = (e) => {
        setSingerData((prev) => ({ ...prev, status: e.target.value }));
    };

    return (
        <>
            <BoxHead title="Sửa ca sĩ" />
            <form ref={formRef} onSubmit={handleSubmit} method="POST" className="from-singer">
                <div className="from-singer__group">
                    <label htmlFor="fullName">Họ tên *</label>
                    <input type="text" id="fullName" name="fullName" value={singerData.fullName} readOnly />
                </div>
                <div className="from-singer__group">
                    <label htmlFor="avatar">Ảnh đại diện</label>
                    <input type="file" id="avatar" name="avatar" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && (
                        <img src={imagePreview} className="create-singer-avatar-preview" alt="Avatar Preview" />
                    )}
                </div>
                <div className="from-singer__box">
                    <label>Trạng thái</label>
                    <div className="from-singer__status">
                        <label className="from-singer__item">
                            <input type="radio" id="statusActive" name="status" value="active" checked={singerData.status === "active"} onChange={handleStatusChange}/>
                            <span>Hoạt động</span>
                        </label>
                        <label className="from-singer__item">
                            <input type="radio" id="statusInactive" name="status" value="inactive" checked={singerData.status === "inactive"} onChange={handleStatusChange}/>
                            <span>Ngừng hoạt động</span>
                        </label>
                    </div>
                </div>
                <div className="from-singer__btn">
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
    );
}

export default EditSinger;

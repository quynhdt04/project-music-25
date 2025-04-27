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


  useEffect(() => {
    const fetchAPI = async () => {
      const result = await get_all_roles();
      setRoles(result.roles);
    };
    fetchAPI();
  }, []);

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
      if (result.message) {
        toast.success("Tạo tài khoản thành công!", { transition: Bounce });
        formRef.current.reset();
        setImagePreview(null);
        setAvatarFile(null);
        navigate(-1);
      } else {
        toast.error(result.error, { transition: Bounce });
      }
    } catch (error) {
      console.error("Lỗi khi tạo tài khoản:", error);
      toast.error("Lỗi khi tạo tài khoản!", { transition: Bounce });
    }
  };

  return (
    <>
      <BoxHead title="Tạo tài khoản mới" />
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        method="POST"
        className="from-account"
      >
        <div className="from-account__group">
          <label htmlFor="fullName">Họ tên *</label>
          <input type="text" id="fullName" name="fullName" required />
        </div>

        <div className="from-account__group">
          <label htmlFor="email">Email *</label>
          <input type="email" id="email" name="email" required />
        </div>

        <div className="from-account__group">
          <label htmlFor="password">Mật khẩu *</label>
          <input type="password" id="password" name="password" required />
        </div>

        <div className="from-account__group">
          <label htmlFor="phone">Số điện thoại</label>
          <input type="tel" id="phone" name="phone" />
        </div>

        <div className="from-account__group">
          <label htmlFor="avatar">Ảnh đại diện</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              className="create-account-avatar-preview"
              alt="Avatar Preview"
            />
          )}
        </div>

        <div className="from-account__group">
          <label htmlFor="role_id">Phân quyền</label>
          <select name="role_id" id="role_id" defaultValue="">
            <option value="" disabled>
              --Chọn--
            </option>
            {roles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
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
                defaultChecked
              />
              <span>Hoạt động</span>
            </label>
            <label className="from-account__item">
              <input
                type="radio"
                id="statusInactive"
                name="status"
                value="inactive"
              />
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
          <button type="submit" className="btn btn-create">
            Tạo mới
          </button>
        </div>
      </form>
    </>
  );
}

export default CreateAccount;

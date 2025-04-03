import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  editProfile,
  getUserById,
  editProfileWithAvatar
} from "../../../services/UserService"; 
import { updateUser } from "../../../reducers/index";

const EditProfileModal = ({ onClose }) => {
  const user = useSelector((state) => state.authenReducer.user);
  const dispatch = useDispatch();

  const [userData, setUserData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    avatar: user?.avatar || null,
  });

  const [errors, setErrors] = useState({});
  useEffect(() => {
    // Nếu có thông tin người dùng trong store, cập nhật lại dữ liệu ban đầu
    if (user) {
      setUserData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        avatar: user.avatar || null,
      });
    }
  }, [user]);
  
  

  const validate = (data) => {
    const errors = {};
    if (!data.fullName) errors.fullName = "Họ tên không được để trống.";
    
    if (!data.phone) {
      errors.phone = "Số điện thoại không được để trống.";
    } else if (!/^0\d{9}$/.test(data.phone)) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }

    if (data.password && !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(data.password)) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự, gồm chữ hoa, số và ký tự đặc biệt.";
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));

    // Ẩn lỗi ngay khi nhập đúng
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  
  const handleSave = async () => {
    const validationErrors = validate(userData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", userData.fullName);
      formData.append("phone", userData.phone);
      if (userData.password) {
        formData.append("password", userData.password);
      }
      if (userData.avatar instanceof File) {
        formData.append("avatar", userData.avatar);
      }

      let response;
      if (userData.avatar instanceof File) {
        // Gửi yêu cầu chỉnh sửa hồ sơ với avatar
        response = await editProfileWithAvatar(user.id, formData);
      } else {
        // Gửi yêu cầu chỉnh sửa hồ sơ không có avatar
        response = await editProfile(user.id, userData);
      }

      if (response) {
        // Cập nhật user trong Redux
        dispatch(updateUser(response));

        // Cập nhật lại dữ liệu trong state của component
        setUserData({
          fullName: response.fullName,
          email: response.email,
          phone: response.phone,
          avatar: response.avatar,
        });

        // Thông báo thành công
        toast.success("Cập nhật thành công!");
        onClose();
      }
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật:", error);
      toast.error("Có lỗi xảy ra khi cập nhật!");
    }
  };


  
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Chỉnh sửa tài khoản</h2>
        <input
          type="text"
          name="fullName"
          placeholder="Họ tên"
          value={userData.fullName}
          onChange={(e) => handleChange(e)}
        />
        {errors.fullName && <p className="error-message">{errors.fullName}</p>}
        <input type="email" value={userData.email} disabled />
        <input
          type="password"
          placeholder="Mật khẩu (để trống nếu không đổi)"
          onChange={(e) => handleChange(e)}
        />
        {errors.password && <p className="error-message">{errors.password}</p>}
        <input
          type="text"
          placeholder="Số điện thoại"
          value={userData.phone}
          onChange={(e) => handleChange(e)}
        />
        {errors.phone && <p className="error-message">{errors.phone}</p>}
        <div className="avatar-preview"> 
        {userData.avatar ? (
          <img
            src={
              userData.avatar instanceof File
                ? URL.createObjectURL(userData.avatar)
                : userData.avatar
            }
            alt="Avatar"
            style={{
              width: 150,
              height: 120,
              objectFit: "cover",
              
            }}
          />
        ) : (
          <p>Chưa có ảnh đại diện</p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files.length > 0) {
              console.log("File ảnh được chọn:", e.target.files[0]);
              setUserData({ ...userData, avatar: e.target.files[0] });
            }
          }}
        />
        </div>

        <div className="button-group">
          <button onClick={handleSave}>Lưu thay đổi</button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

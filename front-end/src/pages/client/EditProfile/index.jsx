import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  editProfile,
  editProfileWithAvatar,
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
      console.log("Avatar nhận được:", user.avatar);
      
      setUserData({ 
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        avatar: user.avatar || null,
      });
    }
  }, [user]);

  useEffect(() => {
    console.log("🎯 Dữ liệu user mới nhất:", userData);
  }, [userData]);

  const validate = (data) => {
    const errors = {};
    if (!data.fullName) errors.fullName = "Họ tên không được để trống.";

    if (!data.phone) {
      errors.phone = "Số điện thoại không được để trống.";
    } else if (!/^0\d{9}$/.test(data.phone)) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }

    if (
      data.password &&
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(data.password)
    ) {
      errors.password =
        "Mật khẩu phải có ít nhất 6 ký tự, gồm chữ hoa, số và ký tự đặc biệt.";
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

      // Kiểm tra nếu avatar là đối tượng File
      if (userData.avatar instanceof File) {
        formData.append("avatar", userData.avatar);
      } else {
        console.error("❌ Avatar không phải là file hợp lệ:", userData.avatar);
      }

      // Debug FormData
      console.log("📤 Dữ liệu gửi đi:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      let response;
      if (userData.avatar instanceof File) {
        // Gửi yêu cầu chỉnh sửa hồ sơ với avatar
        response = await editProfileWithAvatar(user.id, userData.avatar);
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

      toast.success("Cập nhật thành công");
      onClose();
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật:", error);
      toast.error("Có lỗi xảy ra khi cập nhật!");
    }
  };

  
  // const handleUpdatePremiumStatus = async (userId, isPremium) => {
  //   try {
  //     const updatedUser = await updatePremiumStatus(userId, isPremium);
      
  //     // Dispatch action để cập nhật thông tin người dùng vào Redux
  //     dispatch(updateUser(updatedUser));
  
  //     // Cập nhật lại localStorage
  //     localStorage.setItem('user', JSON.stringify(updatedUser));
      
  //     console.log("Trạng thái Premium đã được cập nhật:", updatedUser);
  //   } catch (error) {
  //     console.error("Lỗi khi cập nhật trạng thái Premium:", error);
  //   }
  // };
  

  return (
    <div className="modal modal-thuytrang">
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
          name="password"
          placeholder="Mật khẩu (để trống nếu không đổi)"
          value={userData.password}
          onChange={(e) => handleChange(e)}
        />
        {errors.password && <p className="error-message">{errors.password}</p>}
        <input
          type="text"
          name="phone"
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

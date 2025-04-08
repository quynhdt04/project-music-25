import React, { useState, useEffect } from "react";
import { registerUser } from "../../../services/UserService";
import { toast } from "react-toastify";
import { getUserById } from "../../../services/UserService";
import { useNavigate } from "react-router-dom";

function RegisterForm({ onClose, onRegisterSuccess }) {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    avatar: null,
    avatarPreview: null,
    isPremium: false,
    premiumExpiresAt: null,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({
        ...userData,
        avatar: file,
        avatarPreview: URL.createObjectURL(file), // Tạo URL ảnh xem trước
      });
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("userId");
        const user = await getUserById(userId);
        console.log("Dữ liệu avatar từ API:", user.avatar); // Kiểm tra avatar trong React
        setUserData(user);
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
      }
    }
    fetchUser();
  }, []);

  const validate = (data) => {
    const errors = {};
    if (!data.fullName) errors.fullName = "Họ tên không được để trống.";
    if (!data.email) {
      errors.email = "Email không được để trống.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Email không hợp lệ.";
    }
    if (!data.password) {
      errors.password = "Mật khẩu không được để trống.";
    } else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(data.password)
    ) {
      errors.password =
        "Mật khẩu phải có ít nhất 6 ký tự, gồm chữ hoa, số và ký tự đặc biệt.";
    }
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Mật khẩu không khớp.";
    }
    if (!data.phone) {
      errors.phone = "Số điện thoại không được để trống.";
    } else if (!/^0\d{9}$/.test(data.phone)) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }
    return errors;
  };

  const handleRegister = async () => {
    // ✅ Kiểm tra dữ liệu trước khi gửi
    console.log("📌 Dữ liệu userData trước khi gửi:", userData);

    const validationErrors = validate(userData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // ✅ Chuyển userData thành FormData
    const formData = new FormData();
    formData.append("fullName", userData.fullName);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("phone", userData.phone);
    formData.append("isPremium", userData.isPremium);
    if (userData.premiumExpiresAt) {
      formData.append("premiumExpiresAt", userData.premiumExpiresAt);
    }
    if (userData.avatar) {
      formData.append("avatar", userData.avatar);
    }

    // ✅ Kiểm tra dữ liệu FormData
    console.log("📌 Dữ liệu FormData trước khi gửi:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      // ✅ Gửi FormData thay vì userData
      const response = await registerUser(formData);
      toast.success("Đăng ký thành công!");
      onRegisterSuccess();
      onClose();
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      let errorMessage = "Đã xảy ra lỗi khi đăng ký.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="modal modal-thuytrang" style={{ zIndex: 5050 }}>
      <div className="modal-content">
        <h2>Đăng ký tài khoản</h2>
        <input
          type="text"
          name="fullName"
          placeholder="Họ tên"
          value={userData.fullName}
          onChange={handleChange}
        />
        {errors.fullName && <p className="error-message">{errors.fullName}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error-message">{errors.email}</p>}

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={userData.password}
          onChange={handleChange}
        />
        {errors.password && <p className="error-message">{errors.password}</p>}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Nhập lại mật khẩu"
          value={userData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && (
          <p className="error-message">{errors.confirmPassword}</p>
        )}

        <input
          type="text"
          name="phone"
          placeholder="Số điện thoại"
          value={userData.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="error-message">{errors.phone}</p>}
        <div className="avatar-preview">
          {userData.avatarPreview && (
            <img
              src={userData.avatarPreview}
              alt="Ảnh đại diện"
              style={{ width: 150, height: 100, objectFit: "cover" }}
            />
          )}
          <input type="file" name="avatar" onChange={handleFileChange} />
        </div>
        <div className="button-group">
          <button onClick={handleRegister}>Đăng ký</button>
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;

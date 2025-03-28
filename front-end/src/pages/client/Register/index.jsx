import React, { useState } from "react";
import "./Register.css"; // Tạo file CSS nếu cần
import { registerUser } from "../../../services/UserService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function RegisterForm({ onClose, onRegisterSuccess }) {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    avatar: null,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleRegister = async () => {
    console.log("userData:", userData);
    const validationErrors = validate(userData);
    console.log("validationErrors:", validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await registerUser(userData);
      console.log("Đăng ký thành công!");
      // toast.success("Đăng ký thành công!");
      onRegisterSuccess();
      onClose();
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      if (error.message.includes("400")) {
        try {
          const errorData = JSON.parse(error.message.split("400 - ")[1]);
          console.log("Lỗi từ server:", errorData.error);
          // toast.error(errorData.error);
        } catch (parseError) {
          console.log("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
          // toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
        }
      } else {
        console.log(error.message || "Đã xảy ra lỗi khi đăng ký.");
        // toast.error(error.message || "Đã xảy ra lỗi khi đăng ký.");
      }
    }
  };
  const validate = (data) => {
    const errors = {};
    if (!data.fullName) errors.fullName = "Họ tên không được để trống.";
    if (!data.email) errors.email = "Email không được để trống.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Email không hợp lệ."; // Xác thực email
    if (!data.password) errors.password = "Mật khẩu không được để trống.";
    else if (data.password.length < 6)
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự."; // Xác thực mật khẩu
    if (data.password !== data.confirmPassword)
      errors.confirmPassword = "Mật khẩu không khớp.";
    if (!data.phone) {
      errors.phone = "Số điện thoại không được để trống.";
    } else if (!/^0\d{9}$/.test(data.phone)) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }
    return errors;
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Đăng ký tài khoản</h2>
        <input
          type="text"
          placeholder="Họ tên"
          onChange={(e) =>
            setUserData({ ...userData, fullName: e.target.value })
          }
        />
        {errors.fullName && <p className="error-message">{errors.fullName}</p>}
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        />
        {errors.email && <p className="error-message">{errors.email}</p>}
        <input
          type="password"
          placeholder="Mật khẩu"
          onChange={(e) =>
            setUserData({ ...userData, password: e.target.value })
          }
        />
        {errors.password && <p className="error-message">{errors.password}</p>}
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          onChange={(e) =>
            setUserData({ ...userData, confirmPassword: e.target.value })
          }
        />
        {errors.confirmPassword && (
          <p className="error-message">{errors.confirmPassword}</p>
        )}
        <input
          type="text"
          placeholder="Số điện thoại"
          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
        />
        {errors.phone && <p className="error-message">{errors.phone}</p>}
        <input
          type="file"
          onChange={(e) =>
            setUserData({ ...userData, avatar: e.target.files[0] })
          }
        />
        <div className="button-group">
          <button onClick={handleRegister}>Đăng ký</button>
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;

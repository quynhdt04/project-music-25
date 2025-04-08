import { useRef, useState } from "react";
import "./login.css";
import { setCookie } from "../../../helpers/cookie";
import { useNavigate } from "react-router-dom";
import { setAuthAccount, setAuthRole } from "../../../actions/authen";
import { useDispatch } from "react-redux";
import { toast, Bounce } from "react-toastify";
import { loginUser } from "../../../services/UserService"; // Đường dẫn đến file UserService.js

function LoginForm({ onClose, onRegisterClick, onLoginSuccess }) {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const accountData = Object.fromEntries(formData.entries());
    console.log("📌 Dữ liệu gửi lên:", accountData); // Kiểm tra dữ liệu
    // Kiểm tra email
    if (!accountData.email) {
      setEmailError("Email không được để trống.");
      return;
    } else {
      setEmailError("");
    }

    // Kiểm tra mật khẩu
    if (!accountData.password) {
      setPasswordError("Mật khẩu không được để trống.");
      return;
    } else {
      setPasswordError("");
    }

    try {
      console.log("📡 Gửi yêu cầu đăng nhập...");
      const loginResponse = await loginUser(
        accountData.email,
        accountData.password
      );
      console.log("📡 Phản hồi từ API:", loginResponse);
      if (loginResponse.message) {
        const time = 1;
        const user = loginResponse.user;
        console.log("User data from API:", user);
        setCookie("user", JSON.stringify(user), time);
        setCookie("token", loginResponse.token, time);
        dispatch(setAuthAccount(user));
        localStorage.setItem("user", JSON.stringify(user));
        onLoginSuccess(user);
        navigate("/");
        onClose();
        toast.success("Đăng nhập thành công!", { transition: Bounce });
      } else if (loginResponse.error) {
        // Kiểm tra lỗi từ API
        if (loginResponse.error === "user not found") {
          toast.error("Email không tồn tại. Vui lòng kiểm tra lại.", {
            transition: Bounce,
          });
        } else if (loginResponse.error === "incorrect password") {
          toast.error("Mật khẩu không chính xác. Vui lòng thử lại.", {
            transition: Bounce,
          });
        } else {
          toast.error(loginResponse.error, { transition: Bounce });
        }
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Sai email hoặc mật khẩu", { transition: Bounce });
    }
  };
  return (
    <div className="modal modal-thuytrang">
      <div className="modal-content">
        <h2>Đăng nhập</h2>
        <form ref={formRef} onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email" required />
          {emailError && <p className="error-message">{emailError}</p>}
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            required
          />
          {passwordError && <p className="error-message">{passwordError}</p>}
          <div className="separator">
            <button type="submit">Đăng nhập</button>
            <button onClick={onClose}>Đóng</button>
          </div>
        </form>
        <p className="signup-text">
          Bạn chưa có tài khoản?{" "}
          <span
            onClick={onRegisterClick}
            className="signup-link"
            style={{ cursor: "pointer", textDecoration: "underline" }}
          >
            Đăng ký
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;

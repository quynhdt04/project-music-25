import { useRef, useState, useEffect } from "react";
import "./Login.css";
import { setCookie } from "../../../helpers/cookie";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, Bounce } from "react-toastify";
import { loginSuccess } from "../../../reducers/index";
import { loginUser } from "../../../services/UserService"; // Đường dẫn đến file UserService.js

function LoginForm({ onClose, onRegisterClick, onLoginSuccess }) {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    const tokenData = sessionStorage.getItem("token");

    if (userData && tokenData) {
      dispatch(loginSuccess(JSON.parse(userData), tokenData));
    }
  }, [dispatch]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const accountData = Object.fromEntries(formData.entries());
    console.log("📌 Dữ liệu gửi lên:", accountData);

    // Kiểm tra email và mật khẩu
    if (!accountData.email) {
      setEmailError("Email không được để trống.");
      return;
    } else {
      setEmailError("");
    }

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
        accountData.password,
        dispatch
      );
      console.log("📡 Phản hồi từ API:", loginResponse);

      if (loginResponse && loginResponse.token) {
        const { user, token } = loginResponse;
        // ✅ Lưu vào Redux
        dispatch(loginSuccess({ user, token }));

        // ✅ Lưu vào sessionStorage
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("token", token);

        console.log("🔥 Redux State sau khi đăng nhập:", user);
        if (onLoginSuccess) {
            onLoginSuccess(user);
          } else {
            console.warn("⚠️ onLoginSuccess không được truyền vào LoginForm!");
          }
        navigate("/");
        onClose();
        toast.success("Đăng nhập thành công!", { transition: Bounce });
      } else {
        console.error("Lỗi khi nhận token từ API");
        toast.error("Có lỗi xảy ra, vui lòng thử lại!", { transition: Bounce });
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

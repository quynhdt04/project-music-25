import { useState } from "react";
import "./login.css";
import { login } from "../../../services/AccountServices";
import { setCookie } from "../../../helpers/cookie";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthAccount } from "../../../actions/authen";
import { toast, Bounce } from "react-toastify";

function LoginForm({ onClose, onRegisterClick, onLoginSuccess }) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const response = await login(loginData.email, loginData.password);
      if (response.account) {
        const account = response.account;
        setCookie("account", JSON.stringify(account), 1);
        setCookie("token", account.token, 1);
        dispatch(setAuthAccount(account));
        
        // Save user to localStorage for use in LayoutDefault
        localStorage.setItem("user", JSON.stringify(account));

        // Trigger login success and redirect to home page
        onLoginSuccess();
        toast.success("Đăng nhập thành công!", { transition: Bounce });

        navigate("/"); // Redirect to home page
        onClose();
      } else {
        toast.error(response.error || "Đăng nhập thất bại!", { transition: Bounce });
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!", { transition: Bounce });
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Đăng nhập</h2>
        <input
          type="email"
          placeholder="Email"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          required
        />
        <div className="separator">
          <button onClick={handleLogin}>Đăng nhập</button>
          <button onClick={onClose}>Đóng</button>
        </div>
        <p className="signup-text">
          Bạn chưa có tài khoản?{" "}
          <span onClick={onRegisterClick} className="signup-link" style={{ cursor: "pointer", textDecoration: "underline" }}>
            Đăng ký
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;

import { useState } from "react";
function LoginForm({ onClose, onRegisterClick, onLoginSuccess }) {
  const [loginData, setLoginData] = useState({ name: "", password: "" });

  const handleLogin = () => {
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Đăng nhập</h2>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.target.value })
          }
        />
        <div className="separator">
          <button onClick={handleLogin}>Đăng nhập</button>

          <button onClick={onClose}>Đóng</button>

        </div>
        <p className="signup-text">
          Don’t have an account? <span onClick={onRegisterClick} className="signup-link">Signup</span>
        </p>
        
      </div>
    </div>
  );
}

export default LoginForm;

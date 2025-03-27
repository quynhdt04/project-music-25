import { useState } from "react";
// import "./RegisterForm.css";

function RegisterForm({ onClose, onRegisterSuccess }) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    avatar: "",
    accountType: "client",
  });

  const handleRegister = () => {
    if (userData.password !== userData.confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    onRegisterSuccess();
    alert("Đăng ký thành công! 🎉");
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Đăng ký tài khoản</h2>
        <input
          type="text"
          placeholder="Họ tên"
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
        />
        <input
          type="file"
          onChange={(e) => setUserData({ ...userData, avatar: e.target.files[0] })}
        />
        <select
          onChange={(e) => setUserData({ ...userData, accountType: e.target.value })}
          value={userData.accountType}
        >
          <option value="client">Client</option>
          <option value="singer">Singer</option>
        </select>
        <div className="button-group">
          <button onClick={handleRegister}>Đăng ký</button>
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;

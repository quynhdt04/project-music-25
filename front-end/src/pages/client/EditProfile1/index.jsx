import { useState } from "react";
import "./EditProfile.css";
// import { update_my_account } from "../../../services/AccountServices";

function EditProfile({ user, onClose, onSave }) {
  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    accountType: user?.accountType || "client",
  });

  const handleSave = async () => {
   
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Chỉnh sửa tài khoản</h2>
        <input
          type="text"
          placeholder="Họ tên"
          value={userData.name}
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
        />
        <input type="email" value={userData.email} disabled />
        <input
          type="password"
          placeholder="Mật khẩu (để trống nếu không đổi)"
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={userData.phone}
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
          <button onClick={handleSave}>Lưu thay đổi</button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;

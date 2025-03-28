import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";
import { updateProfile } from "../../../services/UserService"; // Giả sử bạn đã tạo hàm này trong UserServices

function EditProfile({ user, onClose, onSave }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: user?.fullName || "",
        email: user?.email || "",
        password: "",
        phone: user?.phone || "",
        avatar: user?.avatar || "",
    });

    const handleSave = async () => {
        try {
            // Gọi hàm updateProfile từ UserService
            const updatedUser = await updateProfile(user.id, {
                fullName: userData.name,
                phone: userData.phone,
                password: userData.password, // Gửi mật khẩu nếu có thay đổi
                avatar: userData.avatar, // Gửi avatar nếu có thay đổi
            });

            if (updatedUser) {
                // Cập nhật thông tin người dùng trong localStorage (nếu cần)
                localStorage.setItem("user", JSON.stringify(updatedUser));

                // Gọi hàm onSave nếu được cung cấp
                if (onSave) {
                    onSave(updatedUser);
                }

                // Đóng modal
                onClose();
            }
        } catch (error) {
            console.error("Lỗi cập nhật hồ sơ:", error);
            // Xử lý lỗi nếu cần
        }
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

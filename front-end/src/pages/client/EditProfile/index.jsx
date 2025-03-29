import React, { useState, useEffect } from "react";
// import "./EditProfileModal.css";
import { editProfile, editProfileWithAvatar,getUserById} from "../../../services/UserService"; // Import getUserById
import { toast } from "react-toastify";

function EditProfileModal({ onClose, id, onSaveSuccess }) {
  console.log("id: là ", id);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    avatar: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserById(id);
        console.log("Dữ liệu từ API:", data);
        setUserData((prevUserData) => ({
          ...prevUserData,
          name:  data.user.fullName || "đfs",
          email:  data.user.email || "",
          phone:  data.user.phone || "",
          // Không cập nhật password ở đây để giữ nguyên giá trị rỗng nếu không thay đổi
          avatar:  data.user.avatar || null,
        }));
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        toast.error("Lỗi lấy thông tin người dùng!");
      }
    };
  
    fetchUserData();
  }, [id]);

  const handleSave = async () => {
    try {
      let response;
      if (userData.avatar) {
        response = await editProfileWithAvatar(id, userData, userData.avatar);
      } else {
        response = await editProfile(id, userData);
      }

      toast.success("Cập nhật thông tin thành công!");
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      toast.error(error.message || "Lỗi cập nhật thông tin!");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Chỉnh sửa tài khoản</h2>
        <input
          type="text"
          placeholder="Họ tên"
          value={userData.name || ""} // Thêm || "" để tránh lỗi undefined
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
        />
        <input type="email" value={userData.email || ""} disabled />
        <input
          type="password"
          placeholder="Mật khẩu (để trống nếu không đổi)"
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={userData.phone || ""}
          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
        />
        <input
          type="file"
          onChange={(e) => setUserData({ ...userData, avatar: e.target.files[0] })}
        />
        <div className="button-group">
          <button onClick={handleSave}>Lưu thay đổi</button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
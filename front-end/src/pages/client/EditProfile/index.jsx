import React, { useState, useEffect } from "react";
// import "./EditProfileModal.css";
import {
  editProfile,
  getUserById,
  editProfileWithAvatar
} from "../../../services/UserService"; 



const EditProfileModal = ({ user, onClose }) => {
  const storedUser = localStorage.getItem("user");
if (storedUser) {
  console.log("📂 Dữ liệu user trong localStorage:", storedUser);
}
  console.log("🚀 User nhận từ props:", user);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    avatar: null,
  });
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Dữ liệu user trong localStorage:", storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("User đã parse từ localStorage:", parsedUser);
      } catch (error) {
        console.error("Lỗi parse JSON:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      console.log("Dữ liệu user trong localStorage:", storedUser);
    }
  }, []);
  useEffect(() => {
    if (user) {
      console.log("Dữ liệu user nhận đượccccccccccccccccccc:", user);
      console.log("Avatar nhận được:", user.avatar);
      
      setUserData({ 
        name: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        avatar: user.avatar || null, // Kiểm tra ảnh
      });
    }
  }, [user]);
  

  
  const handleSave = async () => {
    try {
      let response;
      if (userData.avatar && userData.avatar instanceof File) {
        response = await editProfileWithAvatar(user.id, userData, userData.avatar);
      } else {
        response = await editProfile(user.id, userData);
      }
  
      console.log("✅ Kết quả sau khi cập nhật:", response);
  
      if (response) {
        localStorage.setItem("user", JSON.stringify(response));
  
        // 🚀 Cập nhật lại state từ localStorage để React render lại
        const updatedUser = JSON.parse(localStorage.getItem("user"));
        setUserData({
          name: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
        });
      }
  
      alert("Cập nhật thành công!");
      onClose();
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật:", error);
      alert("Có lỗi xảy ra khi cập nhật!");
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
          onChange={(e) =>
            setUserData({ ...userData, password: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={userData.phone}
          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
        />
        <div className="avatar-preview"> 
        {userData.avatar ? (
          <img
            src={
              userData.avatar instanceof File
                ? URL.createObjectURL(userData.avatar)
                : userData.avatar
            }
            alt="Avatar"
            style={{
              width: 150,
              height: 120,
              objectFit: "cover",
              
            }}
          />
        ) : (
          <p>Chưa có ảnh đại diện</p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files.length > 0) {
              console.log("File ảnh được chọn:", e.target.files[0]);
              setUserData({ ...userData, avatar: e.target.files[0] });
            }
          }}
        />
        </div>

        <div className="button-group">
          <button onClick={handleSave}>Lưu thay đổi</button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

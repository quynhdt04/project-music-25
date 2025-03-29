import React, { useState, useEffect } from "react";
// import "./EditProfileModal.css";
import {
  editProfile,
  getUserById,
  editProfileWithAvatar
} from "../../../services/UserService"; 
import { toast } from "react-toastify";

// function EditProfileModal({ onClose, id, onSaveSuccess }) {
//   console.log("id: là ", id);
//   const [userData, setUserData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//     avatar: null,
//   });

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const data = await getUserById(id);
//         console.log("Dữ liệu từ API:", data);
//         setUserData((prevUserData) => ({
//           ...prevUserData,
//           name:  data.user.fullName || "đfs",
//           email:  data.user.email || "",
//           phone:  data.user.phone || "",
//           // Không cập nhật password ở đây để giữ nguyên giá trị rỗng nếu không thay đổi
//           avatar:  data.user.avatar || null,
//         }));
//       } catch (error) {
//         console.error("Lỗi lấy thông tin người dùng:", error);
//         toast.error("Lỗi lấy thông tin người dùng!");
//       }
//     };

//     fetchUserData();
//   }, [id]);

//   const handleSave = async () => {
//     try {
//       let response;
//       if (userData.avatar) {
//         response = await editProfileWithAvatar(id, userData, userData.avatar);
//       } else {
//         response = await editProfile(id, userData);
//       }

//       toast.success("Cập nhật thông tin thành công!");
//       onSaveSuccess();
//       onClose();
//     } catch (error) {
//       console.error("Lỗi cập nhật thông tin:", error);
//       toast.error(error.message || "Lỗi cập nhật thông tin!");
//     }
//   };
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
  

  // const handleSave = async () => {
  //   try {
  //     console.log("📤 Dữ liệu gửi lên API:", userData);
  
  //     let response;
  //     if (userData.avatar && userData.avatar instanceof File) {
  //       response = await editProfileWithAvatar(user.id, userData, userData.avatar);
  //     } else {
  //       response = await editProfile(user.id, userData);
  //     }
  
  //     console.log("✅ Kết quả sau khi cập nhật:", response);
  
  //     if (response) {
  //       localStorage.setItem("user", JSON.stringify(response));
  //     }
  
  //     alert("Cập nhật thành công!");
  //     onClose();
  //   } catch (error) {
  //     console.error("❌ Lỗi khi cập nhật:", error);
  //     alert("Có lỗi xảy ra khi cập nhật!");
  //   }
  // };
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
        {userData.avatar ? (
          <img
            src={
              userData.avatar instanceof File
                ? URL.createObjectURL(userData.avatar)
                : userData.avatar
            }
            alt="Avatar"
            style={{
              width: 100,
              height: 100,
              objectFit: "cover",
              borderRadius: "50%",
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

        <div className="button-group">
          <button onClick={handleSave}>Lưu thay đổi</button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

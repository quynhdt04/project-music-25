import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./Profile.css";
import { editProfileWithAvatar } from "../../../services/UserService";
import { updateUser } from "../../../reducers/index";
import { toast } from "react-toastify";

function Profile() {
  const user = useSelector((state) => state.authenReducer.user);
  const [userInfo, setUserInfo] = useState(user);
  const dispatch = useDispatch();
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        setUserInfo(JSON.parse(storedUser));
      }
    } else {
      setUserInfo(user);
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    if (e.target.files.length > 0) {
      const newAvatar = e.target.files[0];
      setAvatarFile(newAvatar);

      // Gửi yêu cầu cập nhật avatar lên server
      const formData = new FormData();
      formData.append("avatar", newAvatar);

      editProfileWithAvatar(user.id, newAvatar)
        .then((response) => {
          dispatch(updateUser(response)); // Cập nhật thông tin người dùng trong Redux
          setUserInfo(response);
          toast.success("Cập nhật ảnh đại diện thành công!");
        })
        .catch((error) => {
          console.error("❌ Lỗi khi cập nhật avatar:", error);
          toast.error("Cập nhật ảnh đại diện thất bại.");
        });
    }
  };

  if (!userInfo) return <p>Chưa đăng nhập</p>;
  return (
    <div className="profile-container">
      <div className="profile-info">
        <div className="avatar-wrapper" onClick={() => avatarInputRef.current.click()}>
          <img
            src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar}
            alt="Avatar"
            className="profile-avatar"
            onError={(e) => {
              e.target.src =
                "https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg"; // Ảnh mặc định khi không có avatar
            }}
            // onClick={() => avatarInputRef.current.click()} // Kích hoạt chọn ảnh khi click vào avatar
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }} // Ẩn input file
            onChange={handleAvatarChange}
          />
          <div className="avatar-overlay">
            <span>Choose Photo</span> {/* Gợi ý cho người dùng */}
          </div>
        </div>
        <div className="profile-details">
          <span style={{ fontSize: "15px" }}>Profile</span>
          <h1
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "90px",
            }}
          >
            {user.fullName || "Không có thông tin"}
          </h1>
          <p style={{ fontSize: "15px" }}>
            <strong>Email:</strong> {user.email || "Không có thông tin"}
          </p>
          <p style={{ fontSize: "15px" }}>
            <strong>Số điện thoại:</strong> {user.phone || "Không có thông tin"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;

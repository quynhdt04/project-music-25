import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";


function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
          try {
              const parsedUser = JSON.parse(storedUser);

              // Kiểm tra dữ liệu hợp lệ
              if (typeof parsedUser === "object" && parsedUser !== null) {
                  console.log("User from localStorage:", parsedUser);
                  setUser(parsedUser);
              } else {
                  console.error("Invalid user data in localStorage");
                  // Xử lý trường hợp dữ liệu bị hỏng (ví dụ: chuyển hướng người dùng đến trang đăng nhập)
                  setUser(null); // Đặt user về null để hiển thị "Loading..." hoặc thông báo lỗi
              }
          } catch (error) {
              console.error("Error parsing user from localStorage:", error);
              // Xử lý trường hợp lỗi parse JSON (ví dụ: chuyển hướng người dùng đến trang đăng nhập)
              setUser(null); // Đặt user về null để hiển thị "Loading..." hoặc thông báo lỗi
          }
      }
  }, []);

  if (!user) {
      return (
          <div className="profile-container">
              <h2>Trang cá nhân</h2>
              <p>Loading...</p>
              <button className="back-button" onClick={() => navigate(-1)}>Quay lại</button>
          </div>
      );
  }

    return (
        <div className="profile-container">
            <h2>Trang cá nhân</h2>
            <div className="profile-info">
                <img
                    src={user.avatar || "https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg"}
                    alt="Avatar"
                    className="profile-avatar"
                />
                <div className="profile-details">
                    <p><strong>Họ tên:</strong> {user.fullName || "Không có thông tin"}</p>
                    <p><strong>Email:</strong> {user.email || "Không có thông tin"}</p>
                    <p><strong>Số điện thoại:</strong> {user.phone || "Không có thông tin"}</p>
                </div>
                <button className="back-button" onClick={() => navigate(-1)}>Quay lại</button>
            </div>
        </div>
    );
}

export default Profile;
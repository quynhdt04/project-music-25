import React from "react";
import "./Profile.css"; // Thêm CSS nếu cần

function Profile() {
  return (
    <div className="profile-container">
      <h2>Trang cá nhân</h2>
      <div className="profile-info">
        <img
          src="https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg"
          alt="Avatar"
          className="profile-avatar"
        />
        <div className="profile-details">
          <p><strong>Họ tên:</strong> Nguyễn Văn A</p>
          <p><strong>Email:</strong> nguyenvana@example.com</p>
          <p><strong>Số điện thoại:</strong> 0123 456 789</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;

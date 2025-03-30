import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { size } from "lodash";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Gravitas+One&family=Noto+Sans+KR:wght@100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;1,200;1,300;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (typeof parsedUser === "object" && parsedUser !== null) {
          console.log("User from localStorage:", parsedUser);
          setUser(parsedUser);
        } else {
          console.error("Invalid user data in localStorage");
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        setUser(null);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="profile-container">
        <h2>Trang cá nhân</h2>
        <p>Loading...</p>
        <button className="back-button" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-info">
        <img
          src={user.avatar}
          alt="Avatar"
          className="profile-avatar"
          onError={(e) => {
            e.target.src =
              "https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg";
          }}
        />
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
        {/* <button className="back-button" onClick={() => navigate(-1)}>Quay lại</button> */}
      </div>
    </div>
  );
}

export default Profile;

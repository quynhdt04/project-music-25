import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../reducers/index";
import "./Profile.css";


function Profile() {
  const user = useSelector((state) => state.authenReducer.user);
  const [userInfo, setUserInfo] = useState(user);
  
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
  

  if (!userInfo) return <p>Chưa đăng nhập</p>;
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
      </div>
    </div>
  );
}

export default Profile;
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Profile.css";

// function Profile() {
//     const navigate = useNavigate();
//     const [user, setUser] = useState(null);

//     useEffect(() => {
//         const storedUser = localStorage.getItem("user");
//         if (storedUser) {
//             try {
//                 const parsedUser = JSON.parse(storedUser);
//                 if (typeof parsedUser === "object" && parsedUser !== null) {
//                     console.log("User from localStorage:", parsedUser);
//                     setUser(parsedUser);
//                 } else {
//                     console.error("Invalid user data in localStorage");
//                     setUser(null);
//                 }
//             } catch (error) {
//                 console.error("Error parsing user from localStorage:", error);
//                 setUser(null);
//             }
//         }
//     }, []);

//     if (!user) {
//         return (
//             <div className="profile-container">
//                 <h2>Trang cá nhân</h2>
//                 <p>Loading...</p>
//                 <button className="back-button" onClick={() => navigate(-1)}>Quay lại</button>
//             </div>
//         );
//     }

//     return (
//         <div className="profile-container">
//             <h2>Trang cá nhân</h2>
//             <div className="profile-info">
//                 <img
//                     src={user.avatar}
//                     alt="Avatar"
//                     className="profile-avatar"
//                     onError={(e) => {
//                         e.target.src = "https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg";
//                     }}
//                 />
//                 <div className="profile-details">
//                     <p><strong>Họ tên:</strong> {user.fullName || "Không có thông tin"}</p>
//                     <p><strong>Email:</strong> {user.email || "Không có thông tin"}</p>
//                     <p><strong>Số điện thoại:</strong> {user.phone || "Không có thông tin"}</p>
//                 </div>
//                 <button className="back-button" onClick={() => navigate(-1)}>Quay lại</button>
//             </div>
//         </div>
//     );
// }

// export default Profile;
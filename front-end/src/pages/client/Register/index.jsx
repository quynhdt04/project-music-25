// import React, { useState, useEffect } from "react";
// import "./Register.css";
// import { registerUser } from "../../../services/UserService";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";


// function RegisterForm({ onClose, onRegisterSuccess }) {
//   const [userData, setUserData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     phone: "",
//     avatar: null,
//   });
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUserData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setUserData((prev) => ({ ...prev, avatar: file }));
//   };
//   useEffect(() => {
//     async function fetchUser() {
//       try {
//         const user = await getUserById(userId);
//         console.log("Dữ liệu avatar từ API:", user.avatar); // Kiểm tra avatar trong React
//         setUserData(user);
//       } catch (error) {
//         console.error("Lỗi lấy thông tin người dùng:", error);
//       }
//     }
//     fetchUser();
//   }, []);

//   const validate = (data) => {
//     const errors = {};
//     if (!data.fullName) errors.fullName = "Họ tên không được để trống.";
//     if (!data.email) {
//       errors.email = "Email không được để trống.";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
//       errors.email = "Email không hợp lệ.";
//     }
//     if (!data.password) {
//       errors.password = "Mật khẩu không được để trống.";
//     } else if (data.password.length < 6) {
//       errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
//     }
//     if (data.password !== data.confirmPassword) {
//       errors.confirmPassword = "Mật khẩu không khớp.";
//     }
//     if (!data.phone) {
//       errors.phone = "Số điện thoại không được để trống.";
//     } else if (!/^0\d{9}$/.test(data.phone)) {
//       errors.phone = "Số điện thoại không hợp lệ.";
//     }
//     return errors;
//   };

//   const handleRegister = async () => {
//     const validationErrors = validate(userData);
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     try {
//       const response = await registerUser(userData);
//       toast.success("Đăng ký thành công!");
//       onRegisterSuccess();
//       onClose();
//       navigate("/");
//     } catch (error) {
//       console.error("Lỗi đăng ký:", error);
//       let errorMessage = "Đã xảy ra lỗi khi đăng ký.";
//       if (error.message.includes("400")) {
//         try {
//           const errorData = JSON.parse(error.message.split("400 - ")[1]);
//           errorMessage = errorData.error;
//         } catch (parseError) {
//           errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
//         }
//       }
//       toast.error(errorMessage);
//     }
//   };

//   return (
//     <div className="modal">
//       <div className="modal-content">
//         <h2>Đăng ký tài khoản</h2>
//         <input
//           type="text"
//           name="fullName"
//           placeholder="Họ tên"
//           value={userData.fullName}
//           onChange={handleChange}
//         />
//         {errors.fullName && <p className="error-message">{errors.fullName}</p>}

//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={userData.email}
//           onChange={handleChange}
//         />
//         {errors.email && <p className="error-message">{errors.email}</p>}

//         <input
//           type="password"
//           name="password"
//           placeholder="Mật khẩu"
//           value={userData.password}
//           onChange={handleChange}
//         />
//         {errors.password && <p className="error-message">{errors.password}</p>}

//         <input
//           type="password"
//           name="confirmPassword"
//           placeholder="Nhập lại mật khẩu"
//           value={userData.confirmPassword}
//           onChange={handleChange}
//         />
//         {errors.confirmPassword && (
//           <p className="error-message">{errors.confirmPassword}</p>
//         )}

//         <input
//           type="text"
//           name="phone"
//           placeholder="Số điện thoại"
//           value={userData.phone}
//           onChange={handleChange}
//         />
//         {errors.phone && <p className="error-message">{errors.phone}</p>}

//         <input type="file" name="avatar" onChange={handleFileChange} />

//         <div className="button-group">
//           <button onClick={handleRegister}>Đăng ký</button>
//           <button onClick={onClose}>Đóng</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default RegisterForm;
import React, { useState, useEffect } from "react";
import "./Register.css";
import { registerUser } from "../../../services/UserService";
import { toast } from "react-toastify";
import { getUserById } from "../../../services/UserService"; // Import the missing function
import { useNavigate } from "react-router-dom";

function RegisterForm({ onClose, onRegisterSuccess }) {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    avatar: null,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUserData((prev) => ({ ...prev, avatar: file }));
  };
  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("userId");
        const user = await getUserById(userId);
        console.log("Dữ liệu avatar từ API:", user.avatar); // Kiểm tra avatar trong React
        setUserData(user);
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
      }
    }
    fetchUser();
  }, []);

  const validate = (data) => {
    const errors = {};
    if (!data.fullName) errors.fullName = "Họ tên không được để trống.";
    if (!data.email) {
      errors.email = "Email không được để trống.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Email không hợp lệ.";
    }
    if (!data.password) {
      errors.password = "Mật khẩu không được để trống.";
    } else if (data.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Mật khẩu không khớp.";
    }
    if (!data.phone) {
      errors.phone = "Số điện thoại không được để trống.";
    } else if (!/^0\d{9}$/.test(data.phone)) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }
    return errors;
  };

  const handleRegister = async () => {
    const validationErrors = validate(userData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await registerUser(userData);
      toast.success("Đăng ký thành công!");
      onRegisterSuccess();
      onClose();
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      let errorMessage = "Đã xảy ra lỗi khi đăng ký.";
      if (error.message.includes("400")) {
        try {
          const errorData = JSON.parse(error.message.split("400 - ")[1]);
          errorMessage = errorData.error;
        } catch (parseError) {
          errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
        }
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Đăng ký tài khoản</h2>
        <input
          type="text"
          name="fullName"
          placeholder="Họ tên"
          value={userData.fullName}
          onChange={handleChange}
        />
        {errors.fullName && <p className="error-message">{errors.fullName}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error-message">{errors.email}</p>}

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={userData.password}
          onChange={handleChange}
        />
        {errors.password && <p className="error-message">{errors.password}</p>}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Nhập lại mật khẩu"
          value={userData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && (
          <p className="error-message">{errors.confirmPassword}</p>
        )}

        <input
          type="text"
          name="phone"
          placeholder="Số điện thoại"
          value={userData.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="error-message">{errors.phone}</p>}
        <input type="file" name="avatar" onChange={handleFileChange} />
        <img
          src={userData.avatar || "https://via.placeholder.com/150"}
          alt="Avatar"
          style={{ width: "100px", height: "100px", borderRadius: "50%" }}
        />

        <div className="button-group">
          <button onClick={handleRegister}>Đăng ký</button>
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;

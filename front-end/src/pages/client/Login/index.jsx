import { useRef, useState, useEffect } from "react";
import "./login.css";
import { setCookie } from "../../../helpers/cookie";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, Bounce } from "react-toastify";
import { loginSuccess } from "../../../reducers/index";
import { loginUser } from "../../../services/UserService"; // Đường dẫn đến file UserService.js

function LoginForm({ onClose, onRegisterClick, onLoginSuccess }) {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // useEffect(() => {
  //   // Kiểm tra localStorage khi load lại trang
  //   const authData = localStorage.getItem("authData");
  //   if (authData) {
  //     const { user, token } = JSON.parse(authData);
  //     // Dispatch dữ liệu vào Redux nếu có
  //     dispatch(loginSuccess({ user, token }));
  //   }
  // }, [dispatch]); // Chạy một lần khi component được mount
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    const tokenData = sessionStorage.getItem("token");

    if (userData && tokenData) {
      dispatch(loginSuccess(JSON.parse(userData), tokenData));
    }
  }, [dispatch]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const accountData = Object.fromEntries(formData.entries());
    console.log("📌 Dữ liệu gửi lên:", accountData);

    // Kiểm tra email và mật khẩu
    if (!accountData.email) {
      setEmailError("Email không được để trống.");
      return;
    } else {
      setEmailError("");
    }

    if (!accountData.password) {
      setPasswordError("Mật khẩu không được để trống.");
      return;
    } else {
      setPasswordError("");
    }

    try {
      console.log("📡 Gửi yêu cầu đăng nhập...");
      const loginResponse = await loginUser(
        accountData.email,
        accountData.password,
        dispatch
      );
      console.log("📡 Phản hồi từ API:", loginResponse);

      if (loginResponse && loginResponse.token) {
        const { user, token } = loginResponse;
        // ✅ Lưu vào Redux
        dispatch(loginSuccess({ user, token }));

        // ✅ Lưu vào sessionStorage
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("token", token);

        console.log("🔥 Redux State sau khi đăng nhập:", user);
        if (onLoginSuccess) {
            onLoginSuccess(user);
          } else {
            console.warn("⚠️ onLoginSuccess không được truyền vào LoginForm!");
          }
        navigate("/");
        onClose();
        toast.success("Đăng nhập thành công!", { transition: Bounce });
      } else {
        console.error("Lỗi khi nhận token từ API");
        toast.error("Có lỗi xảy ra, vui lòng thử lại!", { transition: Bounce });
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Sai email hoặc mật khẩu", { transition: Bounce });
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Đăng nhập</h2>
        <form ref={formRef} onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email" required />
          {emailError && <p className="error-message">{emailError}</p>}
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            required
          />
          {passwordError && <p className="error-message">{passwordError}</p>}
          <div className="separator">
            <button type="submit">Đăng nhập</button>
            <button onClick={onClose}>Đóng</button>
          </div>
        </form>
        <p className="signup-text">
          Bạn chưa có tài khoản?{" "}
          <span
            onClick={onRegisterClick}
            className="signup-link"
            style={{ cursor: "pointer", textDecoration: "underline" }}
          >
            Đăng ký
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
// import {  useRef, useState } from "react";
// import "./login.css";
// import { setCookie } from "../../../helpers/cookie";
// import { useNavigate } from "react-router-dom";
// import { get_role } from "../../../services/RoleServices";
// import { setAuthAccount, setAuthRole } from "../../../actions/authen";
// import { useDispatch } from "react-redux";
// import { toast, Bounce } from "react-toastify";
// import { loginUser } from "../../../services/UserService"; // Đường dẫn đến file UserService.js

// function LoginForm({ onClose, onRegisterClick,onLoginSuccess  }) {
//     const formRef = useRef(null);
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [emailError, setEmailError] = useState("");
//     const [passwordError, setPasswordError] = useState("");
//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       const formData = new FormData(formRef.current);
//       const accountData = Object.fromEntries(formData.entries());
//        // Kiểm tra email
//        if (!accountData.email) {
//         setEmailError("Email không được để trống.");
//         return;
//     } else {
//         setEmailError("");
//     }

//     // Kiểm tra mật khẩu
//     if (!accountData.password) {
//         setPasswordError("Mật khẩu không được để trống.");
//         return;
//     } else {
//         setPasswordError("");
//     }

  
//       try {
//           const loginResponse = await loginUser(accountData.email, accountData.password);
//           if (loginResponse.message) {
//               const time = 1;
//               const user = loginResponse.user;
//               console.log("User data from API:", user);
//               setCookie("user", JSON.stringify(user), time);
//               setCookie("token", user.token, time); 
//               dispatch(setAuthAccount(user));
//               localStorage.setItem('user', JSON.stringify(user));
//               onLoginSuccess(user); 
//               navigate("/");
//               onClose();
//               toast.success("Đăng nhập thành công!", { transition: Bounce });
              
//           } else {
//               toast.error(loginResponse.error, { transition: Bounce });
//           }
//       } catch (error) {
//           console.error("Lỗi:", error);
//           toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.", { transition: Bounce });
//       }
//   };  

//     return (
//         <div className="modal">
//             <div className="modal-content">
//                 <h2>Đăng nhập</h2>
//                 <form ref={formRef} onSubmit={handleSubmit}>
//                     <input name="email" type="email" placeholder="Email" required />
//                     {emailError && <p className="error-message">{emailError}</p>}
//                     <input name="password" type="password" placeholder="Mật khẩu" required />
//                     {passwordError && <p className="error-message">{passwordError}</p>}
//                     <div className="separator">
//                         <button type="submit">Đăng nhập</button>
//                         <button onClick={onClose}>Đóng</button>
//                     </div>
//                 </form>
//                 <p className="signup-text">
//                     Bạn chưa có tài khoản?{" "}
//                     <span onClick={onRegisterClick} className="signup-link" style={{ cursor: "pointer", textDecoration: "underline" }}>
//                         Đăng ký
//                     </span>
//                 </p>
//             </div>
//         </div>
//     );
// }

// export default LoginForm;
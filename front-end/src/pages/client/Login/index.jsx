import { useRef } from "react";
import "./login.css";
import { setCookie } from "../../../helpers/cookie";
import { useNavigate } from "react-router-dom";
import { get_role } from "../../../services/RoleServices";
import { setAuthAccount, setAuthRole } from "../../../actions/authen";
import { useDispatch } from "react-redux";
import { toast, Bounce } from "react-toastify";
import { loginUser } from "../../../services/UserService";

function LoginForm({ onClose, onRegisterClick }) {
    const formRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(formRef.current);
      const accountData = Object.fromEntries(formData.entries());
  
      try {
          const loginResponse = await loginUser(accountData.email, accountData.password);
          if (loginResponse.message) {
              const time = 1;
              const user = loginResponse.user;
              setCookie("user", JSON.stringify(user), time);
              setCookie("token", user.token, time); // Giả sử bảng users có token
              dispatch(setAuthAccount(user));
              navigate("/");
              toast.success("Đăng nhập thành công!", { transition: Bounce });
          } else {
              toast.error(loginResponse.error, { transition: Bounce });
          }
      } catch (error) {
          console.error("Lỗi:", error);
          toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.", { transition: Bounce });
      }
  };  

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Đăng nhập</h2>
                <form ref={formRef} onSubmit={handleSubmit}>
                    <input name="email" type="email" placeholder="Email" required />
                    <input name="password" type="password" placeholder="Mật khẩu" required />
                    <div className="separator">
                        <button type="submit">Đăng nhập</button>
                        <button onClick={onClose}>Đóng</button>
                    </div>
                </form>
                <p className="signup-text">
                    Bạn chưa có tài khoản?{" "}
                    <span onClick={onRegisterClick} className="signup-link" style={{ cursor: "pointer", textDecoration: "underline" }}>
                        Đăng ký
                    </span>
                </p>
            </div>
        </div>
    );
}

export default LoginForm;
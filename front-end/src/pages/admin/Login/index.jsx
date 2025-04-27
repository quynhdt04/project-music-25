import { useRef } from "react";
import "./login.css";
import { login } from "../../../services/AccountServices";
import { setCookie } from "../../../helpers/cookie";
import { useNavigate } from "react-router-dom";
import { get_role } from "../../../services/RoleServices";
import { setAuthAccount, setAuthRole } from "../../../actions/authen";
import { useDispatch } from "react-redux";
import { toast, Bounce } from "react-toastify";

function Login({ onClose, onLoginSuccess }) {

    const formRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(formRef.current);
        const accountData = Object.fromEntries(formData.entries());
    
        try {
            const checkLogin = await login(accountData.email, accountData.password);
            if (checkLogin.message) {
                const time = 0.3;
                const account = checkLogin.account;
                const role = await get_role(account.role_id);
                if (role.role) {
                    setCookie("account", JSON.stringify(account), time);
                    setCookie("role", JSON.stringify(role.role), time);
                    setCookie("tokenAdmin", account.token, time);
                    dispatch(setAuthAccount(account));
                    dispatch(setAuthRole(role.role));
                    navigate('/admin/dashboard');
                    toast.success('Đăng nhập thành công!', { transition: Bounce });
    
                    // Gọi onLoginSuccess với thông tin người dùng (nếu cần)
                    if (onLoginSuccess) {
                        onLoginSuccess(account); // Truyền thông tin người dùng lên LayoutDefault
                        onClose();
                    }
    
                } else {
                    toast.error(role.error, { transition: Bounce });
                }
            } else {
                toast.error(checkLogin.error, { transition: Bounce });
    
                // Gọi onLoginSuccess với thông tin người dùng (nếu cần)
                if (onLoginSuccess) {
                    onLoginSuccess(null); // Truyền null hoặc thông báo lỗi nếu đăng nhập thất bại
                    onClose();
                }
            }
        } catch (error) {
            console.error("Lỗi:", error);
    
            // Gọi onLoginSuccess với thông tin người dùng (nếu cần)
            if (onLoginSuccess) {
                onLoginSuccess(null); // Truyền null hoặc thông báo lỗi nếu có lỗi
                onClose();
            }
        }
    };
    return (
        <>
            <div className="login-container">
                <div className="login-box">
                    <h2>Admin Login</h2>
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email</label>
                            <input name="email" type="email" placeholder="Enter your email" required />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input name="password" type="password" placeholder="Enter your password" required />
                        </div>
                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Login;
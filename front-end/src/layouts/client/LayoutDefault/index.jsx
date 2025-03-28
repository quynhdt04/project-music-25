import { Outlet, Link, useNavigate } from "react-router-dom";
import "./LayoutDefault.css";
import { IoIosLogOut } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import LoginForm from "../../../pages/client/Login";
import RegisterForm from "../../../pages/client/Register";
import EditProfileForm from "../../../pages/client/EditProfile";
import Profile from "../../../pages/client/Profile";
function LayoutDefault() {
  const [isLogin, setIsLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleRegisterSuccess = () => {
    alert("Đăng ký thành công!");
  };
  const handleLoginSuccess = (userData) => {
    setIsLogin(true);
    setUser(userData); // Cập nhật state user
};
const handleLogout = () => {
  setIsLogin(false);
  setMenuOpen(false);
  alert("Bạn đã đăng xuất!");
};
const closeModal = () => {
  setShowRegisterForm(false);
};
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLogin(true);
    }
  }, []);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        setIsLogin(true);
        try {
            setUser(JSON.parse(storedUser));
        } catch (error) {
            console.error("Error parsing user from localStorage:", error);
        }
    }
}, []);

 
  return (
    <>
      <div className="app-container">
        <aside className="sidebar">
          <div className="logo">TenSeven Music</div>
          <nav className="menu">
            <ul>
              <li>
                <Link to="/">Trang chủ</Link>
              </li>
              <li>
                <Link to="/songs">Danh sách bài hát</Link>
              </li>
              <li>
                <Link to="/music-love">Bài hát yêu thích</Link>
              </li>
              <li>
                <Link to="/bxh">BXH</Link>
              </li>
            </ul>
          </nav>
        </aside>
        <div className="main-content">
          <header className="header">
            <div className="search-bar">
              <input type="text" placeholder="Tìm kiếm bài hát, nghệ sĩ..." />
            </div>
            <div className="user-menu" ref={menuRef}>
              <img
                src="https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg"
                alt="User Avatar"
                className="avatar"
                onClick={() => setMenuOpen(!menuOpen)}
              />
              <div className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
                {isLogin ? (
                  <>
                    <div className="dropdown-user-info">
                      <img
                        onClick={() => navigate("/profile")}
                        src={
                          user?.avatar ||
                          "https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg"
                        }
                        alt="User Avatar"
                        className="dropdown-avatar"
                      />
                      <p
                        className="dropdown-username"
                        onClick={() => navigate("/profile")}
                      >
                        {user?.name || "Nguyễn Văn A"}
                      </p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button
                      className="menu-item"
                      onClick={() => setShowEditForm(true)}
                    >
                      <FaRegUser /> Chỉnh sửa tài khoản
                    </button>
                    <button className="menu-item" onClick={handleLogout}>
                      <IoIosLogOut /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <button
                    className="menu-item"
                    onClick={() => setShowLoginForm(true)}
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            </div>
          </header>
          <main>
            <Outlet />
          </main>
        </div>
      </div>
      {showProfile && (
        <div className="profile-modal">
          <div className="profile-content" ref={profileRef}>
            <Profile />
          </div>
        </div>
      )}

      {showLoginForm && (
        <LoginForm
          onClose={() => setShowLoginForm(false)}
          onRegisterClick={() => {
            setShowLoginForm(false);
            setShowRegisterForm(true);
          }}
          onLoginSuccess={() =>{handleLoginSuccess}}
        />
      )}

      {showRegisterForm && (
        <RegisterForm
          onClose={closeModal}
          onRegisterSuccess={handleRegisterSuccess} // Chỉ cần truyền hàm onRegisterSuccess
        />
      )}

      {showEditForm && (
        <EditProfileForm onClose={() => setShowEditForm(false)} />
      )}
      <footer className="footer"></footer>
    </>
  );
}

export default LayoutDefault;

import { Outlet, Link } from "react-router-dom";
import "./LayoutDefault.css";
import { IoIosLogOut } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import LoginForm from "../../../pages/client/Login";
import RegisterForm from "../../../pages/client/Register";
import EditProfileForm from "../../../pages/client/EditProfile";
import { FaUserCircle } from "react-icons/fa";

function LayoutDefault() {
  const [isLogin, setIsLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
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

  const handleLogout = () => {
    setIsLogin(false);
    setMenuOpen(false);
    alert("Bạn đã đăng xuất!");
  };

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
                    <button
                      className="menu-item"
                      onClick={() => setShowEditForm(true)}
                    >
                      Chỉnh sửa tài khoản <FaRegUser />
                    </button>
                    <button className="menu-item" onClick={handleLogout}>
                      Đăng xuất <IoIosLogOut />
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
      {showLoginForm && (
        <LoginForm
          onClose={() => setShowLoginForm(false)}
          onRegisterClick={() => {
            setShowLoginForm(false);
            setShowRegisterForm(true);
          }}
          onLoginSuccess={() => setIsLogin(true)}
        />
      )}

      {showRegisterForm && (
        <RegisterForm
          onClose={() => setShowRegisterForm(false)}
          onRegisterSuccess={() => setIsLogin(true)}
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

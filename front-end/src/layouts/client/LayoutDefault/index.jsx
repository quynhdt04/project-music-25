import { Outlet, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LayoutDefault.css";
import { IoIosLogOut } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import LoginForm from "../../../pages/client/Login";
import RegisterForm from "../../../pages/client/Register";
import EditProfileForm from "../../../pages/client/EditProfile";
import Profile from "../../../pages/client/Profile";
import { FaHome, FaMusic, FaHeart, FaList, FaChartBar } from "react-icons/fa";
import { GiMusicalScore } from "react-icons/gi";
import { Menu } from "antd";

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
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState("home");


  const handleRegisterSuccess = () => {
    toast.success("Đăng ký thành công!");
    navigate("/login"); // Chuyển hướng đến trang đăng nhập
  };
  const handleLoginSuccess = (userData) => {
    console.log("userData received:", userData);
    setIsLogin(true);
    setUser(userData);
    console.log("user state updated:", userData);
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsLogin(false);
    setUser(null); // Reset user state khi đăng xuất
    setMenuOpen(false);
    alert("Bạn đã đăng xuất!");
    navigate("/");
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
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLogin(true);
      try {
        const parsedUser = JSON.parse(storedUser);
        if (typeof parsedUser === "object" && parsedUser !== null) {
          console.log("User from localStorage:", parsedUser);
          setUser(parsedUser);
        } else {
          console.error("Invalid user data in localStorage");
          // Xử lý trường hợp dữ liệu bị hỏng (ví dụ: chuyển hướng người dùng đến trang đăng nhập)
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        // Xử lý trường hợp lỗi parse JSON (ví dụ: chuyển hướng người dùng đến trang đăng nhập)
      }
    }
  }, []);


  const menuItems = [
    { key: "home", icon: <FaHome />, label: <Link to="/">Trang chủ</Link> },
    { key: "songs", icon: <FaMusic />, label: <Link to="/songs">Danh sách bài hát</Link> },
    { key: "music-love", icon: <FaHeart />, label: <Link to="/music-love">Bài hát yêu thích</Link> },
    { key: "playlist", icon: <FaList />, label: <Link to="/playlist">Danh sách phát nhạc</Link> },
    { key: "bxh", icon: <FaChartBar />, label: <Link to="/bxh">BXH</Link> },
  ];

  return (
    <>
      <div className="app-container">
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="logo" onClick={() => setCollapsed(!collapsed)}>
            {!collapsed ? "TenSeven Music" : <GiMusicalScore />}
          </div>
          <Menu
            className="style-menu"
            mode="inline"
            theme="dark"
            onClick={({ key }) => setSelectedMenuKey(key)}
            selectedKeys={[selectedMenuKey]} 
            inlineCollapsed={collapsed}
            items={menuItems}
          />
        </aside>
        <div className="main-content">
          <header className="header">
            <div className="search-bar">
              <input type="text" placeholder="Tìm kiếm bài hát, nghệ sĩ..." />
            </div>
            <div className="user-menu" ref={menuRef}>
              <img
                src={
                  user?.avatar ||
                  "https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg"
                }
                alt="User Avatar"
                className="avatar"
                onClick={() => setMenuOpen(!menuOpen)}
              />
              <div className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
                {isLogin ? (
                  <>
                    <div className="dropdown-user-info">
                      <img
                        onClick={() => navigate(`/profile/${user.id}`)}
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
                        {user?.fullName || "Người dùng"}
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
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showRegisterForm && (
        <RegisterForm
          onClose={() => {
            console.log("Closing register form");
            closeModal();
          }}
          onRegisterSuccess={() => {
            console.log("Register success");
            handleRegisterSuccess();
          }}
        />
      )}

      {showEditForm && user && user.id && (
        <EditProfileForm onClose={() => setShowEditForm(false)} user={user} />
      )}
      <footer className="footer"></footer>
    </>
  );
}

export default LayoutDefault;

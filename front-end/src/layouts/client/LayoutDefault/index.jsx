import { Outlet, Link, useNavigate } from "react-router-dom";
import { toast, Bounce } from "react-toastify";
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
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../../reducers/index";
import dayjs from "dayjs";

function LayoutDefault() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const [selectedMenuKey, setSelectedMenuKey] = useState("home");
  const user = useSelector((state) => state.authenReducer.user);
  const isLogin = Boolean(user);
  const isPremium = user?.isPremium;
  const [checkedPremium, setCheckedPremium] = useState(false);

  const handleRegisterSuccess = () => {
    setShowRegisterForm(false);
    setShowLoginForm(false);
  };
  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Bạn đã đăng xuất");
    setShowLoginForm(false);
    navigate("/");
    setMenuOpen(false);
  };
  const handleLoginSuccess = (user) => {
    const token = sessionStorage.getItem("token");
    if (user && user.id && token) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user,
          token,
        },
      });
    }
    setShowLoginForm(false);
    setCheckedPremium(false);
  };

  const closeModal = () => {
    setShowRegisterForm(false);
    setShowLoginForm(true);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser).user;
      dispatch(updateUser(user));
    }
  }, [dispatch]);

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
    if (user && !checkedPremium) {
      const premiumExpiresAt = dayjs(user?.premiumExpiresAt);
      const currentDate = dayjs();

      // Kiểm tra ngày hết hạn nếu có sự thay đổi
      if (!premiumExpiresAt.isValid()) {
        // toast.warning("Thông tin gói Premium không hợp lệ.");
        setCheckedPremium(true);
        return;
      }

      // Nếu ngày hết hạn đã qua
      if (currentDate.isAfter(premiumExpiresAt)) {
        toast.warning("Gói Premium đã hết hạn", {
          transition: Bounce,
        });

        // sessionStorage.removeItem("user");
        // sessionStorage.removeItem("token");
        // dispatch({ type: "LOGOUT" });
        setShowLoginForm(true);
      } else {
        setCheckedPremium(true); // Đánh dấu đã kiểm tra
      }
    }
  }, [user, checkedPremium, dispatch]); // Cập nhật khi user thay đổi

  const menuItems = [
    { key: "home", icon: <FaHome />, label: <Link to="/">Trang chủ</Link> },
    {
      key: "songs",
      icon: <FaMusic />,
      label: <Link to="/songs">Danh sách bài hát</Link>,
    },
    ...(isLogin
      ? [
          {
            key: "music-love",
            icon: <FaHeart />,
            label: <Link to="/music-love">Bài hát yêu thích</Link>,
          },
          {
            key: "playlist",
            icon: <FaList />,
            label: <Link to="/playlist">Danh sách phát nhạc</Link>,
          },
        ]
      : []),
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
              {isLogin &&
                (isPremium ? (
                  <button className="upgrade-button">🌟 Premium</button>
                ) : (
                  <button
                    className="upgrade-button"
                    onClick={() => navigate("/vip")}
                  >
                    Nâng cấp tài khoản
                  </button>
                ))}
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
          onLoginSuccess={handleLoginSuccess} // ✅ Cập nhật user ngay khi đăng nhập
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

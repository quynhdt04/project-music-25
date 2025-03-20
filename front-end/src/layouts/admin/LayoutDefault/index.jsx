import "./LayoutDefault.css";
import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoIosLogOut } from "react-icons/io";
import {
  FaTachometerAlt,
  FaTags,
  FaMicrophone,
  FaMusic,
  FaUsers,
  FaUserShield,
  FaUnlockAlt,
  FaCog,
  FaRegUser,
  FaUserTie,
} from "react-icons/fa";

function LayoutDefault() {
  const account = useSelector((state) => state.authenReducer.account);
  const role = useSelector((state) => state.authenReducer.role);
  return (
    <>
      <div className="app-container">
        <aside className="admin__sidebar">
          <div className="admin__logo">TenSeven Music</div>
          <nav className="admin__menu">
            <ul>
              <li>
                <Link to="/admin/dashboard">
                  {" "}
                  <FaTachometerAlt
                    size={20}
                    style={{ marginRight: "5px" }}
                  />{" "}
                  Tổng quan
                </Link>
              </li>
              {role?.permissions?.includes("topic_view") && (
                <li>
                  <Link to="/admin/topics">
                    <FaTags size={20} style={{ marginRight: "5px" }} /> Chủ đề
                  </Link>
                </li>
              )}
              {role?.permissions?.includes("singer_view") && (
                <li>
                  <Link to="/admin/singers">
                    {" "}
                    <FaMicrophone size={20} style={{ marginRight: "5px" }} /> Ca
                    sĩ
                  </Link>
                </li>
              )}
              {role?.permissions?.includes("song_view") && (
                <li>
                  <Link to="/admin/songs">
                    {" "}
                    <FaMusic size={20} style={{ marginRight: "5px" }} />
                    Bài hát
                  </Link>
                </li>
              )}
              {role?.permissions?.includes("user_view") && (
                <li>
                  <Link to="/admin/users">
                    {" "}
                    <FaUsers size={20} style={{ marginRight: "5px" }} />
                    Người dùng
                  </Link>
                </li>
              )}
              {role?.permissions?.includes("account_view") && (
                <li>
                  <Link to="/admin/accounts">
                    {" "}
                    <FaUserTie size={20} style={{ marginRight: "5px" }} /> Tài
                    khoản
                  </Link>
                </li>
              )}
              {role?.permissions?.includes("role") && (
                <li>
                  <Link to="/admin/roles">
                    <FaUserShield size={20} style={{ marginRight: "5px" }} />{" "}
                    Nhóm quyền
                  </Link>
                </li>
              )}
              {role?.permissions?.includes("role") && (
                <li>
                  <Link to="/admin/roles/permissions">
                    {" "}
                    <FaUnlockAlt size={20} style={{ marginRight: "5px" }} />
                    Phân quyền
                  </Link>
                </li>
              )}
              {role?.permissions?.includes("general_view") && (
                <li>
                  <Link to="/admin/general">
                    {" "}
                    <FaCog size={20} style={{ marginRight: "5px" }} />
                    Cài đặt chung
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </aside>
        <div className="admin__main-content">
          <header className="admin__header">
            <div className="admin__user-menu">
              <img src={account.avatar} alt="User Avatar" />
              <div className="user-menu">
                <Link to="/admin/info-user">
                  <button className="menu-item">
                    Cá nhân <FaRegUser />
                  </button>
                </Link>
                <Link to="/admin/logout">
                  <button className="menu-item">
                    Đăng xuất <IoIosLogOut />
                  </button>
                </Link>
              </div>
            </div>
          </header>
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export default LayoutDefault;

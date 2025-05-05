import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoIosLogOut } from "react-icons/io";
import { GiMusicalScore } from "react-icons/gi";
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
  FaComments
} from "react-icons/fa";
import { JournalAlbum } from "react-bootstrap-icons";
import { Menu } from "antd";
import "./LayoutDefault.css";

const menuItems = [
  { key: "dashboard", role: "dashboard", icon: <FaTachometerAlt />, label: <Link to="/admin/dashboard">Tổng quan</Link> },
  { key: "topic_view", role: "topic_view", icon: <FaTags />, label: <Link to="/admin/topics">Chủ đề</Link> },
  { key: "singer_view", role: "singer_view", icon: <FaMicrophone />, label: <Link to="/admin/singers">Ca sĩ</Link> },
  { key: "song_view", role: "song_view", icon: <FaMusic />, label: <Link to="/admin/songs">Bài hát</Link> },
  { key: "songs-approval_view", role: "songs-approval_view", icon: <FaMusic />, label: <Link to="/admin/songs-approval">Duyệt bài hát</Link> },
  { key: "albums-approval_view", role: "albums-approval_view", icon: <JournalAlbum />, label: <Link to="/admin/albums-approval">Duyệt album</Link> },
  { key: "user_view", role: "user_view", icon: <FaUsers />, label: <Link to="/admin/users">Người dùng</Link> },
  { key: "account_view", role: "account_view", icon: <FaUserTie />, label: <Link to="/admin/accounts">Tài khoản</Link> },
  { key: "role_1", role: "role", icon: <FaUserShield />, label: <Link to="/admin/roles">Nhóm quyền</Link> },
  { key: "role_2", role: "role", icon: <FaUnlockAlt />, label: <Link to="/admin/roles/permissions">Phân quyền</Link> },
  { key: "conversation_view", role: "conversation_view", icon: <FaComments />, label: <Link to="/admin/conversations">Trò chuyện</Link> },
  { key: "general_view", role: "general_view", icon: <FaCog />, label: <Link to="/admin/general">Cài đặt chung</Link> },
];

function LayoutDefault() {
  const account = useSelector((state) => state.authenReducer.account);
  const role = useSelector((state) => state.authenReducer.role);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState("dashboard");

  return (
    <div className="app-container">
      <aside className="admin__sidebar">
        <div className="admin__logo" onClick={() => setCollapsed(!collapsed)}>
          {!collapsed ? "TenSeven Music" : <GiMusicalScore />}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          onClick={({ key }) => setSelectedMenuKey(key)}
          selectedKeys={[selectedMenuKey]}
          inlineCollapsed={collapsed}
          items={menuItems
            .filter(
              (item) =>
                role?.permissions?.includes(item.role)
            )
            .map((item) => ({ ...item, key: item.menuKey }))}
        />
      </aside>
      <div className="admin__main-content">
        <header className="admin__header">
          <div className="admin__user-menu">
            <img src={account?.avatar || ""} alt="User Avatar" />
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
  );
}

export default LayoutDefault;
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
  { menuKey: "dashboard", key: "dashboard", icon: <FaTachometerAlt />, label: <Link to="/admin/dashboard">Tổng quan</Link> },
  { menuKey: "topic_view", key: "topic_view", icon: <FaTags />, label: <Link to="/admin/topics">Chủ đề</Link> },
  { menuKey: "singer_view", key: "singer_view", icon: <FaMicrophone />, label: <Link to="/admin/singers">Ca sĩ</Link> },
  { menuKey: "song_view", key: "song_view", icon: <FaMusic />, label: <Link to="/admin/songs">Bài hát</Link> },
  { menuKey: "songs-approval_view", key: "songs-approval_view", icon: <FaMusic />, label: <Link to="/admin/songs-approval">Duyệt bài hát</Link> },
  { menuKey: "albums-approval_view", key: "albums-approval_view", icon: <JournalAlbum />, label: <Link to="/admin/albums-approval">Duyệt album</Link> },
  { menuKey: "user_view", key: "user_view", icon: <FaUsers />, label: <Link to="/admin/users">Người dùng</Link> },
  { menuKey: "account_view", key: "account_view", icon: <FaUserTie />, label: <Link to="/admin/accounts">Tài khoản</Link> },
  { menuKey: "role_1", key: "role", icon: <FaUserShield />, label: <Link to="/admin/roles">Nhóm quyền</Link> },
  { menuKey: "role_2", key: "role", icon: <FaUnlockAlt />, label: <Link to="/admin/roles/permissions">Phân quyền</Link> },
  { menuKey: "conversation_view", key: "conversation_view", icon: <FaComments />, label: <Link to="/admin/conversations">Trò chuyện</Link> },
  { menuKey: "general_view", key: "general_view", icon: <FaCog />, label: <Link to="/admin/general">Cài đặt chung</Link> },
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
            .filter((item) => role?.permissions?.includes(item.key) || item.key == "dashboard")
            .map((item) => ({ ...item, key: item.menuKey }))}  
        />
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
  );
}

export default LayoutDefault;

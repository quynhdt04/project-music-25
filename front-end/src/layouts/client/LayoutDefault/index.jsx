import { Outlet, Link } from "react-router-dom";
import "./LayoutDefault.css";
import { IoIosLogOut } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";

function LayoutDefault() {
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
            <div className="user-menu">
              <img
                src="https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg"
                alt="User Avatar"
              />
              <div className="user-menu__sub">
                <button className="menu-item">
                  Cá nhân <FaRegUser />
                </button>
                <Link to="/logout">
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
      <footer className="footer"></footer>
    </>
  );
}

export default LayoutDefault;

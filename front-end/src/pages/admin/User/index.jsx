import BoxHead from "../../../components/BoxHead";
import { useEffect, useState } from "react";
import "./User.scss";
import { get_all_users, delete_user } from "../../../services/UserServices";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast, Bounce } from "react-toastify";
import { useSelector } from "react-redux";

function User() {
    const [users, setUsers] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const MySwal = withReactContent(Swal);
    const [searchTerm, setSearchTerm] = useState(""); // Lưu từ khóa tìm kiếm
    const roleCheck = useSelector((state) => state.authenReducer.role);

    useEffect(() => {
        const fetchAPI = async () => {
            try {
                const resultUsers = await get_all_users();
                setUsers(resultUsers.users);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách người dùng:", error);
                setUsers([]);  // Tránh lỗi khi request thất bại
            }
        };
        fetchAPI();
    }, [refresh]);

    // Gọi hàm này sau khi thêm/sửa/xóa người dùng để làm mới danh sách
    const reloadUsers = () => setRefresh((prev) => !prev);

    const handleDelete = async (user_id) => {
        console.log("Đang xoá người dùng với ID:", user_id);

        if (!user_id) {
            console.error("Lỗi: ID người dùng bị undefined!");
            return;
        }

        MySwal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa người dùng này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await delete_user(user_id);
                    console.log("Phản hồi từ server:", response);

                    if (response.message) {
                        reloadUsers();
                        Swal.fire("Thành công!", "Người dùng đã được xóa.", "success");
                    } else {
                        Swal.fire("Thất bại!", response.error || "Không thể xóa người dùng.", "error");
                    }
                } catch (error) {
                    console.error("Lỗi khi xoá người dùng:", error);
                    Swal.fire("Lỗi!", "Không thể kết nối tới server.", "error");
                }
            }
        });
    };

    // Hàm xử lý tìm kiếm
    const searchUsers = (users, searchTerm) => {
        const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Nếu không có từ khóa tìm kiếm, trả về danh sách gốc
        if (!searchTerm.trim()) return users;

        return users.filter((user) =>
            removeAccents(user.fullName).toLowerCase().includes(removeAccents(searchTerm).toLowerCase())
        );
    }
    // Lọc người dùng theo từ khóa tìm kiếm
    const filteredUsers = searchUsers(users, searchTerm);

    return (
        <>
            <BoxHead title="Danh sách người dùng" />
            <div className="user">
                <div className="user__body">
                    <div className="user__controll">
                        <div className="user__search">
                            <input type="text" placeholder="Tìm kiếm..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        {roleCheck && roleCheck?.permissions?.includes("user_create") && (
                            <div className="user__create">
                                <Link to="/admin/users/create" className="user__btn user__btn-success" >+ Thêm mới</Link>
                            </div>
                        )}
                    </div>
                    <table className="user__table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Avatar</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>SĐT</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <img
                                                src={user.avatar || "/default-avatar.png"}
                                                alt="Avatar"
                                                width="100px"
                                                height="auto"
                                            />
                                        </td>
                                        <td>{user.fullName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone}</td>
                                        <td>
                                            <span className={`user__badge ${user.status === "active" ? "user__badge-success" : "user__badge-danger"}`}>
                                                {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                                            </span>
                                        </td>
                                        <td style={{ width: '210px' }}>
                                            <Link className="user__btn user__btn-info" to={`/admin/users/view/${user.id}`}>Chi tiết</Link>
                                            {roleCheck && roleCheck?.permissions?.includes("user_edit") && (
                                                <Link className="user__btn user__btn-warning" to={`/admin/users/edit/${user.id}`}>
                                                    Sửa
                                                </Link>
                                            )}
                                            {roleCheck && roleCheck?.permissions?.includes("user_del") && (
                                                <button className="user__btn user__btn-danger" onClick={() => handleDelete(user.id)} >
                                                    Xóa
                                                </button>
                                            )}
                                        </td>
                                    </tr>

                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                        Không có người dùng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    )
}

export default User;
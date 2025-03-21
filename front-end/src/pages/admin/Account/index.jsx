import { useEffect, useState } from "react";
import BoxHead from "../../../components/BoxHead";
import "./Account.scss";
import { get_all_accounts, patch_account } from "../../../services/AccountServices";
import { Link } from "react-router-dom";
import { get_all_roles } from "../../../services/RoleServices";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function Account() {
    const [accounts, setAccounts] = useState([]);
    const [roles, setRoles] = useState([]);
    const [data, setData] = useState([]);
    const MySwal = withReactContent(Swal);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const fetchAPI = async () => {
            try {
                const resultAccounts = await get_all_accounts();
                const resultRoles = await get_all_roles();
                setAccounts(resultAccounts.accounts);
                setRoles(resultRoles.roles);

                // Lọc các tài khoản có role_id tồn tại trong danh sách roles
                const newData = resultAccounts.accounts
                    .map(account => {
                        const role = resultRoles.roles.find(item => item.id === account.role_id);
                        return role ? { ...account, role } : null;
                    })
                    .filter(account => account !== null); // Loại bỏ tài khoản không có role

                setData(newData);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tài khoản:", error);
            }
        };
        fetchAPI();
    }, [refresh]);

    const handleDel = async (id) => {

        MySwal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa tài khoản này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await patch_account(id, { deleted: true });
                if (response.message) {
                    setRefresh(refresh => !refresh);
                    Swal.fire("Thành công!", "Tài khoản đã được xóa.", "success");
                } else {
                    Swal.fire("Thất bại!", "Không thể xóa tài khoản.", "error");
                }
            }
        });
    }

    return (
        <>
            <BoxHead title="Danh sách tài khoản" />
            <div className="account">
                <div className="account__body">
                    <div className="account__controll">
                        <div className="account__search">
                            <input type="text" placeholder="Tìm kiếm..." />
                            <button>Tìm</button>
                        </div>
                        <div className="account__create">
                            <Link to="/admin/accounts/create" className="account__btn account__btn-success" >+ Thêm mới</Link>
                        </div>
                    </div>
                    <table className="account__table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Avatar</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Phân quyền</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((account, index) => (
                                    <tr key={account.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <img
                                                src={account.avatar || "/default-avatar.png"}
                                                alt="Avatar"
                                                width="100px"
                                                height="auto"
                                            />
                                        </td>
                                        <td>{account.fullName}</td>
                                        <td>{account.email}</td>
                                        <td>{account.role.title}</td>
                                        <td>
                                            <span className={`account__badge ${account.status === "active" ? "account__badge-success" : "account__badge-danger"}`}>
                                                {account.status === "active" ? "Hoạt động" : "Không hoạt động"}
                                            </span>
                                        </td>
                                        <td>
                                            <a className="account__btn account__btn-warning" href={`/admin/accounts/edit/${account.id}`}>
                                                Sửa
                                            </a>
                                            <button className="account__btn account__btn-danger" onClick={() => handleDel(account.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                        Không có tài khoản nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Account;

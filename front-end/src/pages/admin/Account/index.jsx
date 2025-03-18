import { useEffect, useState } from "react";
import BoxHead from "../../../components/BoxHead";
import "./Account.css";
import { get_all_accounts } from "../../../services/AccountServices";
import { Link } from "react-router-dom";
import { get_all_roles } from "../../../services/RoleServices";

function Account() {
    const [accounts, setAccounts] = useState([]);
    const [roles, setRoles] = useState([]);
    const [data, setData] = useState([]);

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
    }, []);

    return (
        <>
            <BoxHead title="Danh sách tài khoản" />
            <div className="account__search-box">
                <input type="text" placeholder="Tìm kiếm..." />
                <button>Tìm</button>
            </div>
            <div className="account__card">
                <div className="account__card-header">Danh sách</div>
                <div className="account__card-body">
                    <div className="account__text-right">
                        <Link to="/admin/accounts/create" className="account__btn account__btn-success" >+ Thêm mới</Link>
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
                                            <a className="account__btn account__btn-secondary" href={`/admin/accounts/detail/${account.id}`}>
                                                Chi tiết
                                            </a>
                                            <a className="account__btn account__btn-warning" href={`/admin/accounts/edit/${account.id}`}>
                                                Sửa
                                            </a>
                                            <button className="account__btn account__btn-danger">Xóa</button>
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

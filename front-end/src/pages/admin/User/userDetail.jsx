import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { get_user_by_id } from "../../../services/UserServices";
import "./UserDetail.css";
import BoxHead from "../../../components/BoxHead";

function UserDetail() {
    const { id: userId } = useParams();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await get_user_by_id(userId);
                if (response && response.user) {
                    setUserData(response.user);
                } else {
                    setError("Không tìm thấy người dùng!");
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
                setError("Lỗi khi kết nối tới server!");
            }
        };
        fetchUser();
    }, [userId]);

    if (error) return <p className="error-message">{error}</p>;
    if (!userData) return <p className="loading-message">Đang tải dữ liệu...</p>;

    return (
        <>
            <BoxHead title="Thông tin chi tiết người dùng" />
            <div className="user-detail">
                <div className="user-info">
                    <img src={userData.avatar || "/default-avatar.png"} alt="Avatar" className="user-avatar" />
                    <div className="user-text">
                        <p><strong>Họ tên:</strong> {userData.fullName}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <p><strong>Số điện thoại:</strong> {userData.phone}</p>
                        <p><strong>Trạng thái:</strong>
                            <span className={userData.status === "active" ? "status-active" : "status-inactive"}>
                                {userData.status === "active" ? " Hoạt động" : " Không hoạt động"}
                            </span>
                        </p>
                        <p><strong>Ngày tạo:</strong> {userData.createdAt}</p>
                        <p><strong>Ngày cập nhật:</strong> {userData.updatedAt}</p>
                    </div>
                </div>
                <Link to="/admin/users" className="btn-back">⬅️ Quay lại</Link>
            </div>
        </>

    );
}

export default UserDetail;

import BoxHead from "../../../components/BoxHead";
import { useEffect, useState } from "react";
import "./Singer.scss";
import { get_all_singers, delete_singer } from "../../../services/SingerServices";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast, Bounce } from "react-toastify";
import { useSelector } from "react-redux";
function Singer() {
    const [singers, setSingers] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const MySwal = withReactContent(Swal);
    const [searchTerm, setSearchTerm] = useState(""); // Lưu từ khóa tìm kiếm
    const roleCheck = useSelector((state) => state.authenReducer.role);

    useEffect(() => {
        const fetchAPI = async () => {
            try {
                const resultSingers = await get_all_singers();
                setSingers(resultSingers.singers);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách ca sĩ:", error);
                setSingers([]);  // Tránh lỗi khi request thất bại
            }
        };
        fetchAPI();
    }, [refresh]);

    // Gọi hàm này sau khi thêm/sửa/xóa ca sĩ để làm mới danh sách
    const reloadSingers = () => setRefresh((prev) => !prev);

    const handleDelete = async (singer_id) => {
        console.log("Đang xoá ca sĩ với ID:", singer_id);

        if (!singer_id) {
            console.error("Lỗi: ID ca sĩ bị undefined!");
            return;
        }

        MySwal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa ca sĩ này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await delete_singer(singer_id);
                    console.log("Phản hồi từ server:", response);

                    if (response.message) {
                        reloadSingers();
                        Swal.fire("Thành công!", "Ca sĩ đã được xóa.", "success");
                    } else {
                        Swal.fire("Thất bại!", response.error || "Không thể xóa ca sĩ.", "error");
                    }
                } catch (error) {
                    console.error("Lỗi khi xoá ca sĩ:", error);
                    Swal.fire("Lỗi!", "Không thể kết nối tới server.", "error");
                }
            }
        });
    };

    // Hàm xử lý tìm kiếm
    const searchSingers = (singers, searchTerm) => {
        const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Nếu không có từ khóa tìm kiếm, trả về danh sách gốc
        if (!searchTerm.trim()) return singers;

        return singers.filter((singer) =>
            removeAccents(singer.fullName).toLowerCase().includes(removeAccents(searchTerm).toLowerCase())
        );
    };

    // Lọc ca sĩ theo từ khóa tìm kiếm
    const filteredSingers = searchSingers(singers, searchTerm);

    return (
        <>
            <BoxHead title="Danh sách ca sĩ" />
            <div className="singer">
                <div className="singer__body">
                    <div className="singer__controll">
                        <div className="singer__search">
                            <input type="text" placeholder="Tìm kiếm..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        {roleCheck && roleCheck?.permissions?.includes("singer_create") && (
                            <div className="singer__create">
                                <Link to="/admin/singers/create" className="singer__btn singer__btn-success" >+ Thêm mới</Link>
                            </div>
                        )}
                    </div>
                    <table className="singer__table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Avatar</th>
                                <th>Họ tên</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Ngày cập nhật</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSingers.length > 0 ? (
                                filteredSingers.map((singer, index) => (
                                    <tr key={singer.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <img
                                                src={singer.avatar || "/default-avatar.png"}
                                                alt="Avatar"
                                                width="100px"
                                                height="auto"
                                            />
                                        </td>
                                        <td>{singer.fullName}</td>
                                        <td>
                                            <span className={`singer__badge ${singer.status === "active" ? "singer__badge-success" : "singer__badge-danger"}`}>
                                                {singer.status === "active" ? "Hoạt động" : "Không hoạt động"}
                                            </span>
                                        </td>
                                        <td>{singer.createdAt}</td>
                                        <td>{singer.updatedAt}</td>
                                        <td style={{ width: '150px' }}>
                                            {roleCheck && roleCheck?.permissions?.includes("singer_edit") && (
                                                <Link className="singer__btn singer__btn-warning" to={`/admin/singers/edit/${singer.id}`}>
                                                    Sửa
                                                </Link>
                                            )}
                                            {roleCheck && roleCheck?.permissions?.includes("singer_del") && (
                                                <button className="singer__btn singer__btn-danger" onClick={() => handleDelete(singer.id)}>Xóa</button>
                                            )}
                                        </td>
                                    </tr>

                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                        Không có ca sĩ nào
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

export default Singer;
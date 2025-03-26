import BoxHead from "../../../components/BoxHead";
import { useEffect, useState } from "react";
import "./Singer.scss";
import { get_all_singers } from "../../../services/SingerServices";
import { Link } from "react-router-dom";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";

function Singer() {
    const [singers, setSingers] = useState([]);
    const [refresh, setRefresh] = useState(false);

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

    return (
        <>
            <BoxHead title="Danh sách ca sĩ" />
            <div className="singer">
                <div className="singer__body">
                    <div className="singer__controll">
                        <div className="singer__search">
                            <input type="text" placeholder="Tìm kiếm..." />
                            <button>Tìm</button>
                        </div>
                        <div className="singer__create">
                            <Link to="/admin/singers/create" className="singer__btn singer__btn-success" >+ Thêm mới</Link>
                        </div>
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
                            {singers.length > 0 ? (
                                singers.map((singer, index) => (
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
                                            <Link className="singer__btn singer__btn-warning" to={`/admin/singers/edit/${singer.id}`}>
                                                Sửa
                                            </Link>

                                            <button className="singer__btn singer__btn-danger">Xóa</button>
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
import { useEffect, useState } from "react";
import BoxHead from "../../../components/BoxHead";
import "./topic.css";
import { get_all_topics } from "../../../services/TopicServices";
import { Link } from "react-router-dom";

function Topic() {
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        const fetchAPI = async () => {
            try {
                const result = await get_all_topics();
                setTopics(result.topics);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách chủ đề:", error);
            }
        };
        fetchAPI();
    }, []);

    return (
        <>
            <BoxHead title="Danh sách chủ đề" />
            <div className="topic__search-box">
                <input type="text" placeholder="Tìm kiếm..." />
                <button>Tìm</button>
            </div>
            <div className="topic__card">
                <div className="topic__card-header">Danh sách</div>
                <div className="topic__card-body">
                    <div className="topic__text-right">
                        <Link to="/admin/topics/create" className="topic__btn topic__btn-success">+ Thêm mới</Link>
                    </div>
                    <table className="topic__table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên chủ đề</th>
                                <th>Hình ảnh</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topics.length > 0 ? (
                                topics.map((topic, index) => (
                                    <tr key={topic.id}>
                                        <td>{index + 1}</td>
                                        <td>{topic.title}</td>
                                        <td>
                                            <img
                                                src={topic.image || "/default-image.png"}
                                                alt="Topic"
                                                width="100px"
                                                height="auto"
                                            />
                                        </td>
                                        <td>
                                            <span className={`topic__badge ${topic.status === "active" ? "topic__badge-success" : "topic__badge-danger"}`}>
                                                {topic.status === "active" ? "Hiển thị" : "Ẩn"}
                                            </span>
                                        </td>
                                        <td>
                                            <a className="topic__btn topic__btn-secondary" href={`/admin/topics/detail/${topic.id}`}>
                                                Chi tiết
                                            </a>
                                            <a className="topic__btn topic__btn-warning" href={`/admin/topics/edit/${topic.id}`}>
                                                Sửa
                                            </a>
                                            <button className="topic__btn topic__btn-danger">Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                                        Không có chủ đề nào
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

export default Topic;

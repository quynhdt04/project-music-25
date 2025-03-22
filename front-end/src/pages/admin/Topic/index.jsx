import { useEffect, useState } from "react";
import BoxHead from "../../../components/BoxHead";
import "./topic.css";
import { get_all_topics } from "../../../services/TopicServices";
import CreateTopic from "./createTopic";
import EditTopic from "./editTopic";
import { delete_topic_by_id } from "../../../services/TopicServices";

function Topic() {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]); // chủ đề sau khi lọc
  const [searchKeyword, setSearchKeyword] = useState(""); // từ khóa tìm kiếm
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const result = await get_all_topics();
        setTopics(result.topics);
        setFilteredTopics(result.topics); // Hiển thị tất cả ban đầu
      } catch (error) {
        console.error("Lỗi khi lấy danh sách chủ đề:", error);
      }
    };
    fetchAPI();
  }, []);

  const handleSearch = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      setFilteredTopics(topics); // nếu rỗng thì hiển thị lại tất cả
    } else {
      const filtered = topics.filter((topic) =>
        topic.title.toLowerCase().includes(keyword)
      );
      setFilteredTopics(filtered);
    }
  };
  const handleDelete = async (topicId) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa chủ đề này?");
    if (confirmed) {
      console.log("Gọi API xóa chủ đề với ID:", topicId);
      try {
        await delete_topic_by_id(topicId);
        // Cập nhật lại danh sách chủ đề sau khi xóa
        setTopics((prevTopics) => {
          const updatedTopics = prevTopics.filter((topic) => topic.id !== topicId);
          console.log("Danh sách chủ đề sau khi xóa:", updatedTopics); // Kiểm tra lại trạng thái
          return updatedTopics;
        });
        alert("Xóa chủ đề thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa chủ đề:", error);
        alert("Đã xảy ra lỗi khi xóa.");
      }
    }
  };
  


  return (
    <>
      <BoxHead title="Danh sách chủ đề" />
      <div className="topic__card">
        <div className="topic__card-body">
          <div className="topic__text">
            <div className="topic__search-box">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <button onClick={handleSearch}>Tìm</button>
            </div>
            <div className="topic__text-right">
              <button
                onClick={() => setShowCreateModal(true)}
                className="topic__btn topic__btn-success"
              >
                + Thêm mới
              </button>
            </div>
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
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic, index) => (
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
                      <span
                        className={`topic__badge ${
                          topic.status === "active"
                            ? "topic__badge-success"
                            : "topic__badge-danger"
                        }`}
                      >
                        {topic.status === "active" ? "Hiển thị" : "Ẩn"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingTopicId(topic.id); // Mở modal
                          setIsReadOnly(true); // Chỉ xem
                        }}
                        className="topic__btn topic__btn-secondary"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => {
                          setEditingTopicId(topic.id); // Mở modal
                          setIsReadOnly(false); // Cho chỉnh sửa
                        }}
                        className="topic__btn topic__btn-warning"
                      >
                        Sửa
                      </button>
                      <button
                        className="topic__btn topic__btn-danger"
                        onClick={() => {
                          console.log("ID chủ đề muốn xóa:", topic.id); // Kiểm tra giá trị ID
                          handleDelete(topic.id); // Gọi hàm handleDelete chỉ một lần
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Không có chủ đề nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal thêm mới */}
      {showCreateModal && (
        <CreateTopic onClose={() => setShowCreateModal(false)} />
      )}

      {/* Modal chỉnh sửa */}
      {editingTopicId && (
        <EditTopic
          topicId={editingTopicId}
          readOnly={isReadOnly}
          onClose={() => setEditingTopicId(null)}
        />
      )}
    </>
  );
}

export default Topic;

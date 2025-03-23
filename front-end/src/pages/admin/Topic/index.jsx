import { useEffect, useState } from "react";
import BoxHead from "../../../components/BoxHead";
import "./topic.css";
import { get_all_topics } from "../../../services/TopicServices";
import CreateTopic from "./createTopic";
import EditTopic from "./editTopic";
import { delete_topic_by_id } from "../../../services/TopicServices";
import { removeVietnameseTones } from "../../../helpers/regex";


function Topic() {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // useEffect(() => {
  //   const savedTopics = localStorage.getItem("topics");
  //   console.log("Dữ liệu nhận:", topics);

  //   if (savedTopics) {
  //     const parsedTopics = JSON.parse(savedTopics);

  //     // Đảm bảo thứ tự được giữ nguyên từ localStorage
  //     setTopics(Array.isArray(parsedTopics) ? parsedTopics : [parsedTopics]);
  //     setFilteredTopics(
  //       Array.isArray(parsedTopics) ? parsedTopics : [parsedTopics]
  //     );
  //     console.log("Dữ liệu lấy từ localStorage:", parsedTopics);
  //   } else {
  //     setTopics([]);
  //     setFilteredTopics([]);
  //   }

  //   const fetchAPI = async () => {
  //     try {
  //       const result = await get_all_topics(); // Gọi API lấy danh sách chủ đề
  //       const fetchedTopics = result.topics;

  //       if (
  //         fetchedTopics &&
  //         JSON.stringify(fetchedTopics) !== JSON.stringify(topics)
  //       ) {
  //         setTopics(fetchedTopics);
  //         setFilteredTopics(fetchedTopics);
  //         localStorage.setItem("topics", JSON.stringify(fetchedTopics));
  //         console.log("Dữ liệu topics từ cơ sở dữ liệu:", fetchedTopics);
  //       }
  //     } catch (error) {
  //       console.error("Lỗi khi lấy danh sách chủ đề từ cơ sở dữ liệu:", error);
  //     }
  //   };

  //   if (!savedTopics) {
  //     fetchAPI();
  //   }
  // }, []);

  useEffect(() => {
    const savedTopics = localStorage.getItem("topics");
  
    if (savedTopics) {
      const parsedTopics = JSON.parse(savedTopics);
      setTopics(parsedTopics);
      setFilteredTopics(parsedTopics);
      console.log("Dữ liệu từ localStorage:", parsedTopics);
  
      // Gọi API để cập nhật nếu có thay đổi mới (dữ liệu backend khác local)
      const fetchAPI = async () => {
        try {
          const result = await get_all_topics();
          const fetchedTopics = result.topics;
  
          if (
            fetchedTopics &&
            JSON.stringify(fetchedTopics) !== JSON.stringify(parsedTopics)
          ) {
            // Có khác biệt, cập nhật localStorage
            setTopics(fetchedTopics);
            setFilteredTopics(fetchedTopics);
            localStorage.setItem("topics", JSON.stringify(fetchedTopics));
            console.log("Dữ liệu mới từ API:", fetchedTopics);
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách chủ đề:", error);
        }
      };
  
      fetchAPI(); // Gọi để đồng bộ, nhưng giữ thứ tự cũ nếu giống
    } else {
      // Nếu chưa có localStorage → load lần đầu
      const fetchAPI = async () => {
        try {
          const result = await get_all_topics();
          const fetchedTopics = result.topics;
          setTopics(fetchedTopics);
          setFilteredTopics(fetchedTopics);
          localStorage.setItem("topics", JSON.stringify(fetchedTopics));
          console.log("Dữ liệu ban đầu từ API:", fetchedTopics);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách chủ đề:", error);
        }
      };
  
      fetchAPI();
    }
  }, []);
  

  useEffect(() => {
    if (searchTerm) {
        const search = removeVietnameseTones(searchTerm.toLowerCase());
        const filtered = topics.filter(topic =>
            removeVietnameseTones(topic.title.toLowerCase()).includes(search)
        );
        setFilteredTopics(filtered);
    } else {
        setFilteredTopics(topics);
    }
}, [searchTerm, topics]);
  
  const handleAddTopic = (newTopic) => {
    const updatedTopics = [...topics, newTopic];
    setTopics(updatedTopics);
    setFilteredTopics(updatedTopics);
    localStorage.setItem("topics", JSON.stringify(updatedTopics)); // Lưu lại thứ tự mới vào localStorage
  };

  // Hàm cập nhật chủ đề
//   const handleUpdateTopic = (updatedTopic) => {
//     const updatedTopics = topics.map((topic) =>
//       String(topic.id) === String(updatedTopic.id) ? updatedTopic : topic
//     );
  
//     setTopics(updatedTopics);
//     setFilteredTopics(updatedTopics);
//     localStorage.setItem("topics", JSON.stringify(updatedTopics));
//     console.log("Danh sách topics:", topics);
// console.log("Chủ đề cập nhật:", updatedTopic);
//   };
const handleUpdateTopic = (updatedTopic) => {
  const updatedTopicWithId = {
    ...updatedTopic,
    id: updatedTopic.id || updatedTopic._id,
  };

  const updatedTopics = topics.map((topic) =>
    String(topic.id) === String(updatedTopicWithId.id)
      ? updatedTopicWithId
      : topic
  );

  setTopics(updatedTopics);
  setFilteredTopics(updatedTopics);
  localStorage.setItem("topics", JSON.stringify(updatedTopics));
};


  const handleDelete = async (topicId) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa chủ đề này?");
    if (confirmed) {
      try {
        await delete_topic_by_id(topicId);
        const updatedTopics = topics.filter((topic) => topic.id !== topicId);
        setTopics(updatedTopics);
        setFilteredTopics(updatedTopics);
        localStorage.setItem("topics", JSON.stringify(updatedTopics)); // Lưu lại thứ tự mới vào localStorage
        alert("Xóa chủ đề thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa chủ đề:", error);
        alert("Đã xảy ra lỗi khi xóa.");
      }
    }
  };

  const handleSearch = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      setFilteredTopics(topics);
    } else {
      const filtered = topics.filter((topic) =>
        topic.title.toLowerCase().includes(keyword)
      );
      setFilteredTopics(filtered);
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                        src={topic.avatar || "/default-image.png"}
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
                          setEditingTopicId(topic.id);
                          setIsReadOnly(true);
                        }}
                        className="topic__btn topic__btn-secondary"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => {
                          setEditingTopicId(topic.id);
                          setIsReadOnly(false);
                        }}
                        className="topic__btn topic__btn-warning"
                      >
                        Sửa
                      </button>
                      <button
                        className="topic__btn topic__btn-danger"
                        onClick={() => handleDelete(topic.id)}
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
        <CreateTopic
          onAddTopic={handleAddTopic}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Modal chỉnh sửa */}
      {editingTopicId && (
        <EditTopic
          topicId={editingTopicId}
          readOnly={isReadOnly}
          onUpdateTopic={handleUpdateTopic}
          onClose={() => setEditingTopicId(null)}
        />
      )}
    </>
  );
}

export default Topic;

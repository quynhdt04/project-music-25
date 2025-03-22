import {
    get,
    post
} from "../utils/request";
import { toast } from 'react-toastify';

 const BASE_URL = "http://localhost:8000";
// Lấy danh sách tất cả các chủ đề
export const get_all_topics = async () => {
    const result = await get(`api/topics/`);
    return result;
};

// Tạo mới một chủ đề
export const create_topic = async (topicData) => {
  try {
    const response = await fetch("http://localhost:8000/api/topics/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(topicData),
    });

    if (!response.ok) {
      const errorText = await response.text();  // Trả về HTML lỗi
      console.error("Server trả về lỗi:", errorText);
      toast.error("Lỗi tạo chủ đề (Mã: " + response.status + ")");
      return null;
    }

    const result = await response.json();
    console.log("Thêm thành công:", result.topic);
    toast.success("Tạo chủ đề thành công!");
    return result.topic;

  } catch (error) {
    console.error("Lỗi:", error);
    toast.error("Lỗi khi gọi API!");
    return null;
  }
};







// Lấy thông tin chi tiết một chủ đề theo ID
export const get_topic = async (id) => {
    const result = await get(`api/topics/${id}`);
    return result;
};

// (Optional) Xóa một chủ đề
// export const delete_topic_by_id = async (id) => {
//     const result = await post(`api/topics/delete/${id}`);
//     return result;
// };
// // TopicServices.js
export const delete_topic_by_id = async (topicId) => {
  const url = `http://localhost:8000/api/topics/${topicId}/delete/`;  // URL của API xóa chủ đề

  const response = await fetch(url, {
      method: 'DELETE',  // Đảm bảo phương thức là DELETE
      headers: {
          'Content-Type': 'application/json',
      },
  });

  if (response.ok) {
      console.log('Xóa chủ đề thành công');
      return await response.json();
  } else {
      const errorText = await response.text();
      console.log("Lỗi khi xóa chủ đề:", errorText);  // In ra chi tiết lỗi
      throw new Error(`Lỗi khi xóa chủ đề: ${response.statusText}`);
  }
};






export async function get_topic_by_id(id) {
    const response = await fetch(`${BASE_URL}/api/topics/${id}/`);
    if (!response.ok) {
      throw new Error("Không thể lấy chủ đề theo ID");
    }
    return await response.json();
  }
  
  // Cập nhật chủ đề
  
  export async function update_topic(id, data) {
    const url = `${BASE_URL}/api/topics/edit/${id}`;
    

    console.log("URL gọi API cập nhật:", url);
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    const text = await response.text();
    console.log("Phản hồi từ server:", text);  // 👀 Log để xem HTML hay JSON?
  
    try {
      const jsonData = JSON.parse(text);
      if (!response.ok) {
        throw new Error(jsonData.error || "Lỗi khi cập nhật chủ đề");
      }
      return jsonData;
    } catch (e) {
      console.error("LỖI PARSE JSON:", e);
      throw new Error("Server không trả về JSON!");
    }
  }
  
  
  
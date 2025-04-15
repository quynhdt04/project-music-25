import { get, post, patch } from "../utils/request";
import { toast } from "react-toastify";

// const BASE_URL = "http://localhost:8000";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Lấy danh sách tất cả các chủ đề
export const get_all_topics = async () => {
  const result = await get(`api/topics/`);
  return result;
};

export const get_number_of_topics = async (limit) => {
  const result = await get(`api/topics/get-number-of-topics?limit=${limit}`);
  return result;
};

// Tạo mới một chủ đề
export const create_topic = async (topicData) => {
  try {
    const response = await fetch(`${BASE_URL}api/topics/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(topicData),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Trả về HTML lỗi
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

export const delete_topic_by_id = async (topicId) => {
  const url = `${BASE_URL}api/topics/${topicId}/delete/`; // URL của API xóa chủ đề

  const response = await fetch(url, {
    method: "DELETE", // Đảm bảo phương thức là DELETE
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    console.log("Xóa chủ đề thành công");
    return await response.json();
  } else {
    const errorText = await response.text();
    console.log("Lỗi khi xóa chủ đề:", errorText); // In ra chi tiết lỗi
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
export const patch_topic = async (id, data) => {
  const url = `${BASE_URL}api/topics/edit/${id}/`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const text = await response.text();
    console.log("Phản hồi từ server:", text);

    if (!response.ok) {
      throw new Error(`Lỗi khi cập nhật chủ đề: ${response.statusText}`);
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("LỖI PARSE JSON:", e);
      throw new Error("Phản hồi không phải JSON hợp lệ!");
    }
  } catch (err) {
    console.error("Lỗi khi gửi PATCH:", err);
    throw err;
  }
};

export async function update_topic(id, data) {
  const url = `${BASE_URL}api/topics/edit/${id}/`;

  console.log("URL gọi API cập nhật:", url);

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const text = await response.text(); // Đọc phản hồi như text thay vì JSON
    console.log("Phản hồi từ server:", text); // 👀 Log để xem HTML hay JSON?

    if (!response.ok) {
      throw new Error(`Lỗi khi cập nhật chủ đề: ${response.statusText}`);
    }

    // Thử phân tích JSON nếu phản hồi hợp lệ
    try {
      const jsonData = JSON.parse(text);
      return jsonData;
    } catch (e) {
      console.error("LỖI PARSE JSON:", e);
      throw new Error("Server không trả về JSON hoặc có lỗi khi cập nhật!");
    }
  } catch (e) {
    console.error("Lỗi khi gửi yêu cầu:", e);
    throw new Error("Có lỗi khi gửi yêu cầu cập nhật chủ đề!");
  }
}

export async function get_topic_by_slug(slug) {
  const response = await fetch(
    `${BASE_URL}api/topics/get-topic-by-slug/${slug}/`
  );
  if (!response.ok) {
    throw new Error("Không thể lấy chủ đề theo slug");
  }
  return await response.json();
}

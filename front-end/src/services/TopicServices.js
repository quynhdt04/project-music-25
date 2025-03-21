import {
    get,
    post
} from "../utils/request";

// Lấy danh sách tất cả các chủ đề
export const get_all_topics = async () => {
    const result = await get(`api/topics/`);
    return result;
};

// Tạo mới một chủ đề
export const create_topic = async (data) => {
    const result = await post(`api/topics/create/`, data);
    return result;
};

// Lấy thông tin chi tiết một chủ đề theo ID
export const get_topic = async (id) => {
    const result = await get(`api/topics/${id}`);
    return result;
};

// (Optional) Xóa một chủ đề
export const delete_topic = async (id) => {
    const result = await post(`api/topics/delete/${id}`);
    return result;
};

// (Optional) Cập nhật chủ đề
export const update_topic = async (id, data) => {
    const result = await post(`api/topics/update/${id}`, data);
    return result;
};

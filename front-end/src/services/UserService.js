// src/services/UserService.js

import { get, post, patch } from "../utils/request";
import { toast } from 'react-toastify';

const BASE_URL = "http://localhost:8000";

const UserService = {
  register: async (userData) => {
    try {
      const result = await post("api/users/create/", userData); // Thay đổi endpoint
      toast.success("Đăng ký thành công!");
      return result;
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      toast.error(`Lỗi đăng ký: ${error.message || "Lỗi không xác định"}`);
      return null;
    }
  },

//   login: async (email, password) => {
//     try {
//       const result = await post("api/users/login/", { email, password }); // Thay đổi endpoint
//       // Lưu thông tin người dùng (nếu cần)
//       return result;
//     } catch (error) {
//       console.error("Lỗi đăng nhập:", error);
//       toast.error(`Lỗi đăng nhập: ${error.message || "Lỗi không xác định"}`);
//       return null;
//     }
//   },

  logout: () => {
    // Xóa thông tin người dùng và token (nếu cần)
    // Ví dụ: localStorage.removeItem('user');
  },

  updateProfile: async (id, userData) => {
    try {
      const result = await patch(`api/users/edit/${id}/`, userData); // Thay đổi endpoint
      toast.success("Cập nhật hồ sơ thành công!");
      return result;
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      toast.error(`Lỗi cập nhật hồ sơ: ${error.message || "Lỗi không xác định"}`);
      return null;
    }
  },

  getUserById: async (id) => {
    try {
      const result = await get(`api/users/${id}/`); // Thay đổi endpoint
      return result;
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error);
      toast.error(`Lỗi lấy thông tin người dùng: ${error.message || "Lỗi không xác định"}`);
      return null;
    }
  }
};
export const login = async (email, password = "") => {
    let pass = "";
    if (password !== "") {
        pass = `&password=${password}`;
    }
    const result = await get(`api/user?email=${email}${pass}`);
    return result;
}
export default UserService;


export const loginUser = async (email, password) => {
    try {
        const response = await fetch("http://127.0.0.1:8000/user/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Trả về dữ liệu người dùng từ bảng users
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        throw error;
    }
};
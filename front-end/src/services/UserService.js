// src/services/UserService.js
import { loginSuccess } from "../reducers/index";

import { setCookie } from "../helpers/cookie";
import { useDispatch } from "react-redux";

export const loginUser = async (email, password, dispatch) => {
  
  try {
    const response = await fetch("http://127.0.0.1:8000/user/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const loginResponse = await response.json(); // Lấy dữ liệu JSON trả về từ API
    console.log("API login response:", loginResponse); // Kiểm tra dữ liệu trả về từ API

    // Kiểm tra nếu có token trả về
    if (loginResponse.token) {
      const user = loginResponse.user;
      const responseToken = loginResponse.token;

      // Lưu thông tin vào sessionStorage, localStorage và cookie
      setCookie("user", JSON.stringify(user), 1);
      setCookie("token", responseToken, 1);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("token", responseToken);

      // Dispatch action để lưu dữ liệu vào Redux
      dispatch({ type: "LOGIN_SUCCESS", payload: { user: user, token: responseToken } });
    }

    return loginResponse; // Trả về dữ liệu người dùng từ API
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    throw error;
  }
};

export async function registerUser(formData) {
  try {
    console.log("📌 Dữ liệu FormData trước khi gửi đến server:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    const response = await fetch("http://127.0.0.1:8000/user/create/", {
      method: "POST",
      body: formData, // ✅ Gửi trực tiếp formData
    });

    if (!response.ok) {
      let errorMessage = `Lỗi đăng ký: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMessage += ` - ${errorData.error}`;
      } catch (parseError) {
        const textError = await response.text();
        errorMessage += ` - ${textError}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    throw error;
  }
}

export async function getUserById(_id) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/user/${_id}/`);
    // Kiểm tra URL
    console.log("bgvvu", _id);
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Lỗi lấy thông tin người dùng: ${response.status} - ${errorData}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error);
    throw error;
  }
}
export async function editProfile(userId, updatedData) {
  console.log(
    "📤 Dữ liệu gửi lên backend:",
    JSON.stringify(updatedData, null, 2)
  );

  try {
    const response = await fetch(`http://127.0.0.1:8000/update/${userId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData), // Chuyển object thành JSON
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi cập nhật hồ sơ: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function editProfileWithAvatar(_id, userData, avatarFile) {
  try {
    const formData = new FormData();
    formData.append("fullName", userData.fullName);
    formData.append("email", userData.email);
    formData.append("phone", userData.phone);

    // Nếu có mật khẩu mới thì thêm vào
    if (userData.password) {
      formData.append("password", userData.password);
    }

    // Nếu có ảnh đại diện mới thì thêm vào
    if (avatarFile && avatarFile instanceof File) {
      formData.append("avatar", avatarFile);
    }

    console.log("🚀 Đang gửi dữ liệu cập nhật:", Object.fromEntries(formData));

    const response = await fetch(`http://127.0.0.1:8000/user/${_id}/update/`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Lỗi cập nhật hồ sơ: ${response.status} - ${errorData}`);
    }

    const updatedUser = await response.json();
    console.log("✅ Cập nhật thành công:", updatedUser);

    return updatedUser;
  } catch (error) {
    console.error("❌ Lỗi cập nhật hồ sơ:", error);
    throw error;
  }
}

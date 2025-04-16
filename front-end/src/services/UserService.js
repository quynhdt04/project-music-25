// src/services/UserService.js
import { loginSuccess } from "../reducers/index";
import { setCookie } from "../helpers/cookie";
import axios from "axios";
import Cookies from "js-cookie";

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
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", responseToken);

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

export const editProfileWithAvatar = async (userId, avatarFile) => {
  const formData = new FormData();

  if (avatarFile && avatarFile instanceof File) {
    formData.append("avatar", avatarFile);
  } else {
    console.error("❌ Không phải là file hợp lệ:", avatarFile);
    throw new Error("Avatar không phải là file hợp lệ.");
  }

  // ✅ Lấy CSRF token từ cookie (Django set cookie này)
  const csrfToken = Cookies.get("csrftoken");

  try {
    const response = await axios.post(
      `http://localhost:8000/users/${userId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrfToken, // 💡 Gửi CSRF token vào header
        },
        withCredentials: true, // 💡 Bắt buộc phải có để browser gửi cookie
      }
    );

    console.log("✅ Avatar updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi cập nhật avatar:", error.response?.data || error);
    throw error;
  }
};

// export const updatePremiumStatus = async (userId, isPremium) => {
//   try {
//     const response = await fetch("http://127.0.0.1:8000/update-premium-status", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ userId, isPremium }), // Truyền userId và isPremium
//     });

//     if (!response.ok) {
//       const errorData = await response.text();
//       throw new Error(`Lỗi cập nhật trạng thái Premium: ${response.status} - ${errorData}`);
//     }

//     const data = await response.json(); // Nhận dữ liệu trả về từ API
//     console.log("✅ Cập nhật trạng thái Premium thành công:", data);
//     return data; // Trả về dữ liệu người dùng đã được cập nhật
//   } catch (error) {
//     console.error("❌ Lỗi khi cập nhật trạng thái Premium:", error);
//     throw error; // Ném lỗi ra để frontend xử lý
//   }
// };
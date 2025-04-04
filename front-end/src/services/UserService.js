// src/services/UserService.js

import { get, post, patch } from "../utils/request";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAuthAccount } from "../actions/authen";


const BASE_URL = "http://localhost:8000";







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
// export const updateProfile = async (userId, userData) => {
//   try {
//     const response = await fetch(`http://127.0.0.1:8000/user/edit/${userId}/`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userData),
//     });

//     if (!response.ok) {
//       // Xử lý lỗi phản hồi từ API một cách chi tiết hơn
//       const errorData = await response.json(); // Lấy thông tin lỗi từ phản hồi API
//       const errorMessage =
//         errorData.message || `HTTP error! status: ${response.status}`;
//       throw new Error(errorMessage);
//     }

//     const data = await response.json();
//     toast.success("Cập nhật hồ sơ thành công!");
//     return data; // Trả về dữ liệu người dùng đã cập nhật
//   } catch (error) {
//     console.error("Lỗi cập nhật hồ sơ:", error);
//     toast.error(`Lỗi cập nhật hồ sơ: ${error.message || "Lỗi không xác định"}`);
//     // Tùy chọn: Xử lý lỗi cụ thể hơn dựa trên loại lỗi
//     if (error instanceof TypeError && error.message === "Failed to fetch") {
//       // Xử lý lỗi kết nối
//     } else if (error.message.includes("400")) {
//       // Xử lý lỗi do dữ liệu không hợp lệ
//     }
//     throw error; // Re-throw lỗi để component gọi hàm này có thể xử lý tiếp nếu cần
//   }
// };
// export const logout = async () => {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     try {
//         // Nếu API logout yêu cầu GET request, hãy sử dụng nó.
//         // Ví dụ: await get("api/logout");
//         // Nếu không yêu cầu request API, bỏ qua bước này.

//         // Xóa thông tin người dùng và token từ localStorage
//         localStorage.removeItem('user');
//         localStorage.removeItem('token');

//         // Xóa các thông tin khác (nếu có)
//         // localStorage.removeItem('role');
//         // localStorage.removeItem('cart');

//         // Cập nhật Redux store (nếu có)
//         dispatch(clearAuthAccount());

//         // Chuyển hướng người dùng đến trang đăng nhập hoặc trang chủ
//         navigate('/'); // hoặc navigate('/login');
//         return { success: true }; // Trả về thông báo thành công nếu cần
//     } catch (error) {
//         console.error("Lỗi đăng xuất:", error);
//         return { success: false, error: error.message || "Lỗi đăng xuất không xác định." }; // Trả về thông báo lỗi nếu cần thiết
//     }
// };
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

// export async function editProfile(_id, userData) {
//   try {
//     console.log("Dữ liệu JSON:", JSON.stringify(userData));
//     const response = await fetch(`http://127.0.0.1:8000/update/${_id}/`, {
      
//       // Kiểm tra URL, đảm bảo có ID người dùng
//       method: "PATCH", 
//       headers: {
//         "Content-Type": "application/json",
//         // Thêm token xác thực nếu cần
//         // 'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(userData),
//     });

//     if (!response.ok) {
//       const errorData = await response.text();
//       throw new Error(`Lỗi cập nhật thông tin: ${response.status} - ${errorData}`);
//     }
//     const responseData = await response.json();
//     return responseData;
//   } catch (error) {
//     console.error("Lỗi cập nhật thông tin:", error);
//     throw error;
//   }
// }

// //Ví dụ sử dụng formData để có thể update avatar

// export async function editProfileWithAvatar(_id, userData, avatarFile) {
//   console.log("Bắt đầu editProfileWithAvatar");
//   try {
//       const formData = new FormData();
//       formData.append('fullName', userData.fullName || ""); //Thêm kiểm tra rỗng
//       formData.append('email', userData.email || ""); //Thêm kiểm tra rỗng
//       formData.append('phone', userData.phone || ""); //Thêm kiểm tra rỗng
//       //...các trường khác của userData

//       if (avatarFile && avatarFile instanceof File) {
//           formData.append('avatar', avatarFile);
//       } else {
//           console.warn("avatarFile không hợp lệ hoặc rỗng");
//       }

//       const token = localStorage.getItem('token'); // Lấy token nếu cần
//       const response = await fetch(`http://127.0.0.1:8000/update/${_id}/`, {
//           method: "PATCH",
//           headers: {
//               'Authorization': `Bearer ${token}` // Thêm token nếu cần
//           },
//           body: formData,
//       });

//       if (!response.ok) {
//           let errorData;
//           if (response.headers.get('content-type')?.includes('application/json')) {
//               errorData = await response.json();
//           } else {
//               errorData = await response.text();
//           }
//           throw new Error(`Lỗi cập nhật thông tin: ${response.status} - ${JSON.stringify(errorData)}`);
//       }
//       const responseData = await response.json();
//       return responseData;
//   } catch (error) {
//       console.error("Lỗi cập nhật thông tin:", error);
//       throw error;
//   }
// }
export async function getUserById(_id) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/user/${_id}/`);
     // Kiểm tra URL
     console.log("bgvvu",_id);
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Lỗi lấy thông tin người dùng: ${response.status} - ${errorData}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error);
    throw error;
  }
}
export async function editProfile(userId, updatedData) {
  console.log("📤 Dữ liệu gửi lên backend:", JSON.stringify(updatedData, null, 2));

  try {
      const response = await fetch(`http://127.0.0.1:8000/update/${userId}/`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),  // Chuyển object thành JSON
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

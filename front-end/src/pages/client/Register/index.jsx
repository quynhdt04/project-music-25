import { useState } from "react";
import { create_account } from "../../../services/AccountServices";

function RegisterForm({ onClose, onRegisterSuccess }) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    avatar: "",
    accountType: "client", // mặc định là client
  });

  const handleRegister = async () => {
    // Kiểm tra mật khẩu
    if (userData.password !== userData.confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    // Kiểm tra các trường bắt buộc
    if (
      !userData.name ||
      !userData.email ||
      !userData.password ||
      !userData.phone ||
      !userData.accountType
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Kiểm tra file avatar
    let avatarUrl = userData.avatar;
    if (userData.avatar && userData.avatar instanceof File) {
      // Upload ảnh lên Cloudinary nếu người dùng chọn file ảnh
      const formData = new FormData();
      formData.append("file", userData.avatar);
      formData.append("upload_preset", "your_cloudinary_preset");

      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/your_cloudinary_account/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        avatarUrl = data.secure_url; // Lấy URL ảnh đã upload
      } catch (error) {
        console.error("Lỗi tải ảnh lên Cloudinary:", error);
        alert("Có lỗi xảy ra khi tải ảnh lên!");
        return;
      }
    }

    // Gửi yêu cầu đăng ký
    try {
      const newAccount = {
        fullName: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        avatar:
          userData.avatar ||
          "https://res.cloudinary.com/dtycrb54t/image/upload/v1742195186/jp0gvzzqtkewbh8ybtml.jpg",
        accountType: userData.accountType, // Đảm bảo gửi đúng accountType
      };
      console.log("Account Type: ", userData.accountType);
      console.log(newAccount);

      const res = await create_account(newAccount);

      if (res.message) {
        alert("Đăng ký thành công! 🎉");
        onRegisterSuccess(); // Gọi hàm từ LayoutDefault để xử lý đăng ký thành công
        onClose(); // Đóng modal
      } else {
        alert("Lỗi đăng ký: " + res.error);
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Đăng ký tài khoản</h2>
        <input
          type="text"
          placeholder="Họ tên"
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          onChange={(e) =>
            setUserData({ ...userData, password: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          onChange={(e) =>
            setUserData({ ...userData, confirmPassword: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
        />
        <input
          type="file"
          onChange={(e) =>
            setUserData({ ...userData, avatar: e.target.files[0] })
          }
        />
        <select
          onChange={(e) =>
            setUserData({ ...userData, accountType: e.target.value })
          }
          value={userData.accountType}
        >
          <option value="client">Client</option>
          <option value="singer">Singer</option>
        </select>
        <div className="button-group">
          <button onClick={handleRegister}>Đăng ký</button>
          <button onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;

// hooks/usePremiumChecker.ts
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import { toast, Bounce } from "react-toastify";
import { loginSuccess } from "../reducers"; // đã có import rồi
import { logout } from "../reducers"; // bạn cần tạo action logout nếu chưa có

export const usePremiumChecker = ({ onRequireLogin }: { onRequireLogin: () => void }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");

    if (!userStr || !token) return;

    const user = JSON.parse(userStr);
    const expiresAt = user?.premiumExpiresAt;

    if (expiresAt && dayjs().isAfter(dayjs(expiresAt))) {
      toast.warning("Gói Premium đã hết hạn, vui lòng đăng nhập lại!", {
        transition: Bounce,
      });

      // Xoá dữ liệu
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      dispatch(logout()); // nếu có
      dispatch(loginSuccess({ user: null, token: null })); // nếu không có logout

      onRequireLogin(); // gọi mở lại modal Login
    }
  }, []);
};

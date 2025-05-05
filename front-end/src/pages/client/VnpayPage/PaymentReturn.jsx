import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Vnpay.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateUser } from "../../../reducers/index";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Log searchParams và localStorage để debug
    console.log("searchParams:", Object.fromEntries(searchParams));
    console.log("localStorage.user:", localStorage.getItem("user"));
    console.log("localStorage.token:", localStorage.getItem("token"));

    const info = {
      title: "Kết quả thanh toán",
      result:
        searchParams.get("vnp_ResponseCode") === "00"
          ? "Thành công"
          : "Thất bại",
      order_id: searchParams.get("vnp_TxnRef"),
      amount: searchParams.get("vnp_Amount"),
      order_desc: searchParams.get("vnp_OrderInfo"),
      vnp_TransactionNo: searchParams.get("vnp_TransactionNo"),
      vnp_ResponseCode: searchParams.get("vnp_ResponseCode"),
      msg: searchParams.get("msg"),
      duration: searchParams.get("duration"),
    };
    setData(info);

    const userFromStorage = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    // Xử lý cả hai cấu trúc: {user: {...}} và {...} trực tiếp
    const user_id = userFromStorage
      ? userFromStorage.user
        ? userFromStorage.user.id
        : userFromStorage.id
      : null;

    if (!user_id || !token) {
      console.error("User ID hoặc token không tồn tại trong localStorage", {
        user_id,
        token,
      });
      toast.error("Vui lòng đăng nhập lại!");
      navigate("/login");
      return;
    }

    // Gửi yêu cầu lưu thông tin thanh toán
    const savePaymentInfo = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/payment-return",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id,
              order_id: info.order_id,
              amount: info.amount,
              order_desc: info.order_desc,
              vnp_TransactionNo: info.vnp_TransactionNo,
              vnp_ResponseCode: info.vnp_ResponseCode,
              msg: info.msg,
              duration: info.duration,
            }),
          }
        );

        const result = await response.json();
        console.log("API payment-return response:", result);

        if (result.code === "00") {
          // Lấy thông tin người dùng mới nhất
          const userRes = await fetch(`http://localhost:8000/user/${user_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!userRes.ok) {
            throw new Error(`Không thể lấy thông tin người dùng: ${userRes.status}`);
          }
          const freshUser = await userRes.json();
          console.log("Fetched user data:", freshUser);

          // Cập nhật localStorage và sessionStorage
          localStorage.setItem("user", JSON.stringify(freshUser));
          sessionStorage.setItem("user", JSON.stringify(freshUser));
          localStorage.setItem("token", token);
          sessionStorage.setItem("token", token);

          // Cập nhật Redux
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: freshUser,
              token,
            },
          });

          // Hiển thị thông báo dựa trên isSuccess từ backend
          if (result.isSuccess) {
            toast.success("Nâng cấp tài khoản thành công!");
          } else {
            toast.error("Thanh toán thất bại hoặc đã bị hủy!");
            // Không xóa user hoặc token, chỉ xóa dữ liệu tạm nếu có
            sessionStorage.removeItem("temporary_payment_data");
          }
        } else {
          console.error("Lỗi khi lưu thanh toán:", result.message);
          toast.error(`Lỗi: ${result.message}`);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        toast.error("Đã xảy ra lỗi khi xử lý thanh toán!");
      }
    };

    savePaymentInfo();
  }, [searchParams, dispatch, navigate]);

  // useEffect(() => {
  //   const userFromStorage = JSON.parse(localStorage.getItem("user"));
  //   console.log("User sau khi cập nhật từ localStorage: ", userFromStorage);

  //   // Nếu thông tin trong localStorage đã được cập nhật, sử dụng nó
  //   if (userFromStorage) {
  //     dispatch(updateUser(userFromStorage));
  //   }
  // }, []);
  // const userFromStorage = JSON.parse(localStorage.getItem("user"));
  // if (userFromStorage) {
  //   dispatch(updateUser(userFromStorage)); // Đảm bảo luôn cập nhật lại thông tin người dùng trong Redux
  // }

  return (
    <div className="payment-return-container">
      <div className="panel panel-default">
        <div className="panel-heading">
          {data.title}: {data.result}
        </div>
        <div className="panel-body">
          <p>order_id: {data.order_id}</p>
          <p>amount: {data.amount}</p>
          <p>order_desc: {data.order_desc}</p>
          <p>vnp_TransactionNo: {data.vnp_TransactionNo}</p>
          {data.vnp_ResponseCode === "00" ? (
            <p>vnp_ResponseCode: {data.vnp_ResponseCode} - Thành công</p>
          ) : (
            <p>vnp_ResponseCode: {data.vnp_ResponseCode} - Lỗi</p>
          )}
          {data.msg && <p className="alert-warning">{data.msg}</p>}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              className="go-back-home-btn"
              onClick={() => navigate("/")}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "center",
                alignItems: "center",
              }}
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn;

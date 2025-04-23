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
    const tokenFromStorage = localStorage.getItem("token");
    const user_id = userFromStorage ? userFromStorage.id : null;
    if (!user_id) {
      console.error("User ID không tồn tại trong localStorage");
    } else {
      console.log("User ID:", user_id);
    }

    if (user_id) {
      // Gửi yêu cầu lưu thông tin thanh toán vào cơ sở dữ liệu
      const savePaymentInfo = async () => {
        const response = await fetch(
          "http://localhost:8000/api/payment-return",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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

        if (result.code === "00") {
          const userRes = await fetch(`http://localhost:8000/user/${user_id}`);
          const freshUser = await userRes.json();
          console.log("Fetched user data:", freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
          sessionStorage.setItem("user", JSON.stringify(freshUser));

          dispatch(updateUser(freshUser));

          toast.success("Nâng cấp tài khoản thành công!");
        } else {
          console.error("Lỗi khi lưu thanh toán:", result.Message);
        }
      };

      savePaymentInfo();
    } else {
      console.error("User ID không tồn tại trong localStorage");
    }
  }, [searchParams]);

  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem("user"));
    console.log("User sau khi cập nhật từ localStorage: ", userFromStorage);

    // Nếu thông tin trong localStorage đã được cập nhật, sử dụng nó
    if (userFromStorage) {
      dispatch(updateUser(userFromStorage));
    }
  }, []);
  const userFromStorage = JSON.parse(localStorage.getItem("user"));
  if (userFromStorage) {
    dispatch(updateUser(userFromStorage)); // Đảm bảo luôn cập nhật lại thông tin người dùng trong Redux
  }

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

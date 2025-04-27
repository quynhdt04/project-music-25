import React, { useEffect, useState } from "react";
import "./Vnpay.css";
import { useSearchParams } from "react-router-dom";

const PaymentForm = () => {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const value = searchParams.get("amount");
    if (value) {
      const parsedAmount = parseInt(value);
      setAmount(parsedAmount);
      setFormData((prev) => ({
        ...prev,
        amount: parsedAmount,
      }));
    }
  }, [searchParams]);
  // Hàm lấy thời gian hiện tại theo định dạng "YYYYMMDDHHmmss"
  const getNow = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds())
    );
  };

  // Hàm lấy thời gian hiện tại theo định dạng "YYYY-MM-DD HH:mm:ss"
  const getNowDatetime = () => {
    const now = new Date();
    return now.toLocaleString("sv-SE"); // "YYYY-MM-DD HH:mm:ss"
  };

  // State để lưu thông tin form
  const [formData, setFormData] = useState({
    order_type: "topup",
    order_id: getNow(),
    amount: 10000,
    order_desc: `Thanh toan don hang thoi gian: ${getNowDatetime()}`,
    bank_code: "",
    language: "vn",
    // user_id: userId,
  });

  // Hàm để lấy CSRF token từ cookie
  const getCSRFToken = () => {
    const cookies = document.cookie.split(";");
    const csrfToken = cookies.find((cookie) =>
      cookie.trim().startsWith("csrftoken=")
    );
    return csrfToken ? csrfToken.split("=")[1] : "";
  };

  // Hàm để xử lý thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm xử lý khi submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Lấy CSRF token
    const csrfToken = getCSRFToken();

    // Gửi yêu cầu POST tới backend
    fetch("http://127.0.0.1:8000/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken, // Thêm CSRF token vào header
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "00") {
          window.location.href = data.data; // Điều hướng tới trang thanh toán hoặc hiển thị popup
        } else {
          alert(data.Message || "Có lỗi xảy ra");
        }
      });
  };

  return (
    <div>
      <div className="payment-form-container">
        <h3>Thanh toán</h3>
        <div className="table-responsive">
          <form id="create_form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Loại hàng hóa</label>
              <select
                name="order_type"
                className="form-control"
                value="billpayment"
                disabled
              >
                <option value="billpayment">Thanh toán hóa đơn</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mã hóa đơn</label>
              <input
                type="text"
                name="order_id"
                className="form-control"
                value={formData.order_id}
                onChange={handleChange}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Số tiền</label>
              <input
                type="number"
                name="amount"
                className="form-control"
                value={formData.amount}
                onChange={handleChange}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Nội dung thanh toán</label>
              <textarea
                name="order_desc"
                className="form-control"
                rows="2"
                value={formData.order_desc}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>Ngân hàng</label>
              <select
                name="bank_code"
                className="form-control"
                value={formData.bank_code}
                onChange={handleChange}
              >
                <option value="">Không chọn</option>
                <option value="NCB">Ngân hàng NCB</option>
                <option value="AGRIBANK">Ngân hàng Agribank</option>
                <option value="SCB">Ngân hàng SCB</option>
                <option value="SACOMBANK">Ngân hàng SacomBank</option>
                <option value="EXIMBANK">Ngân hàng EximBank</option>
                <option value="MSBANK">Ngân hàng MSBANK</option>
                <option value="NAMABANK">Ngân hàng NamABank</option>
                <option value="VNMART">Ví điện tử VnMart</option>
                <option value="VIETINBANK">Ngân hàng Vietinbank</option>
                <option value="VIETCOMBANK">Ngân hàng VCB</option>
                <option value="HDBANK">Ngân hàng HDBank</option>
                <option value="DONGABANK">Ngân hàng Đông Á</option>
                <option value="TPBANK">Ngân hàng TPBank</option>
                <option value="OJB">Ngân hàng OceanBank</option>
                <option value="BIDV">Ngân hàng BIDV</option>
                <option value="TECHCOMBANK">Ngân hàng Techcombank</option>
                <option value="VPBANK">Ngân hàng VPBank</option>
                <option value="MBBANK">Ngân hàng MBBank</option>
                <option value="ACB">Ngân hàng ACB</option>
                <option value="OCB">Ngân hàng OCB</option>
                <option value="IVB">Ngân hàng IVB</option>
                <option value="VISA">Thanh toán qua VISA/MASTER</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ngôn ngữ</label>
              <select
                name="language"
                className="form-control"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="vn">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <button type="submit" className="btn btn-default">
              Thanh toán Redirect
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;

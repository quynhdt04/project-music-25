import React, { useEffect } from 'react';
import './Vnpay.css';

const VnpayPage = ({ title = 'VNPAY DEMO' }) => {
  useEffect(() => {
    const btnPopup = document.getElementById('btnPopup');
    if (btnPopup) {
      btnPopup.addEventListener('click', (e) => {
        e.preventDefault();
        const form = document.getElementById('frmCreateOrder');
        const postData = new FormData(form);
        const submitUrl = form.action;

        fetch(submitUrl, {
          method: 'POST',
          body: postData,
        })
          .then((res) => res.json())
          .then((x) => {
            if (x.code === '00') {
              window.vnpay.open({ width: 480, height: 600, url: x.data });
            } else {
              alert(x.Message);
            }
          });
      });
    }
  }, []);

  return (
    <div className="container">
      <div className="header clearfix">
        {/* Navigation có thể được thêm ở đây nếu cần */}
        <h3 className="text-muted">
          <a href="/">VNPAY DEMO</a>
        </h3>
      </div>

      {/* Nội dung chính sẽ được truyền từ props hoặc router */}
      {/* Đây là phần bạn có thể thay bằng nội dung cụ thể */}
      <div className="panel panel-default">
        <div className="panel-heading">{title}</div>
        <div className="table-responsive">
          <ul className="list-group">
            <li className="list-group-item">
              <a href="/payment">Demo Thanh toán</a>
            </li>
            <li className="list-group-item">
              <a href="/query">Demo Query (Kiểm tra kết quả giao dịch tại VNPAY)</a>
            </li>
            <li className="list-group-item">
              <a href="/refund">Demo Refund (Gửi yêu cầu hoàn tiền cho giao dịch)</a>
            </li>
          </ul>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; VNPAY {new Date().getFullYear()}</p>
      </footer>

      {/* Form tạo đơn hàng (nếu có) */}
      {/* <form id="frmCreateOrder" action="/api/payment" method="POST">
        ... fields here ...
        <button id="btnPopup">Thanh toán</button>
      </form> */}
    </div>
  );
};

export default VnpayPage;

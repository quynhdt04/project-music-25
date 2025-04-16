import React from "react";
import { useEffect, useState } from "react";
import "./Vip.css";
// import { color } from "@cloudinary/url-gen/qualifiers/background";
import { useNavigate } from "react-router-dom";
import PremiumCard  from "../../../components/PremiumCard";

function Vip() {

  const navigate = useNavigate();
  const handleOpenNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePaymentNavigation = (paymentUrl, amount) => {
    const fullUrl = `${paymentUrl}?amount=${amount}`;
    navigate(fullUrl);
  };
  
  return (
    <div className="vip-container">
      <div className="vip-spotify-style">
        <div className="vip-banner">
          <h1>Nghe nhạc không giới hạn. Thử 1 tháng gói Premium chỉ ₫40,000.</h1>
          <div className="vip-buttons">
          <button
            className="btn-primary"
            onClick={() => handlePaymentNavigation("/payment", 40000)}
          >Thử 1 tháng Premium chỉ ₫40,000</button>
          </div>
        </div>
      </div>
      <div className="vip-premium-includes-section">
        <div className="vip-premium-includes-container">
          <h2 className="vip-premium-includes-title">Gói Premium bao gồm</h2>
          <ul className="vip-premium-includes-list">
            <li>Nghe nhạc không quảng cáo</li>
            <li>Tải xuống để nghe ngoại tuyến</li>
            <li>Phát bất kỳ bài hát nào theo thứ tự</li>
            <li>Chất lượng âm thanh cao</li>
            <li>Nghe cùng bạn bè trong thời gian thực</li>
            <li>Sắp xếp hàng đợi phát nhạc</li>
          </ul>
        </div>
      </div>
      <PremiumCard
  title="6 Tháng"
  priceOffer="₫200,000 cho 6 tháng"
  features={[
    "1 tài khoản Premium",
    "Nghe và tải tất cả các bài hát",
    "Đăng ký hoặc thanh toán một lần",
  ]}
  buttonText="Try 6 months for ₫200,000"
  note="₫200,000 for 6 months. Offer only available if you haven't tried Premium before."
  onButtonClick={() => handlePaymentNavigation("/payment", 200000)}
/>

<PremiumCard
  title="12 Tháng"
  priceOffer="₫350,000 cho 12 tháng"
  features={[
    "1 tài khoản Premium",
    "Nghe và tải tất cả các bài hát",
    "Đăng ký hoặc thanh toán một lần",
  ]}
  buttonText="Try 12 months for ₫350,000"
  note="₫350,000 for 12 months"
  onButtonClick={() => handlePaymentNavigation("/payment", 350000)}
/>


      {/* Footer */}
      <div className="vip-footer">
        <div className="vip-footer-container">
          <div className="vip-footer-column">
            <h3>Công ty</h3>
            <ul>
              <li>Giới thiệu</li>
              <li>Việc làm</li>
              <li>For the Record</li>
            </ul>
          </div>
          <div className="vip-footer-column">
            <h3>Cộng đồng</h3>
            <ul>
              <li>Dành cho Nghệ sĩ</li>
              <li>Nhà phát triển</li>
              <li>Quảng cáo</li>
              <li>Nhà đầu tư</li>
              <li>Nhà cung cấp</li>
            </ul>
          </div>
          <div className="vip-footer-column">
            <h3>Liên kết hữu ích</h3>
            <ul>
              <li>Hỗ trợ</li>
              <li>Ứng dụng di động miễn phí</li>
            </ul>
          </div>
          <div className="vip-footer-column">
            <h3>Gói TenSevenMusic</h3>
            <ul>
              <li>Premium Cá nhân</li>
              <li>TenSevenMusic Free</li>
            </ul>
          </div>
          <div className="vip-footer-social">
            <a href="#" className="social-icon instagram"></a>
            <a href="#" className="social-icon twitter"></a>
            <a href="#" className="social-icon facebook"></a>
          </div>
        </div>
        <div className="vip-footer-bottom">
          <ul className="vip-footer-links">
            <li>Pháp lý</li>
            <li>Trung tâm Bảo mật & Quyền riêng tư</li>
            <li>Chính sách Bảo mật</li>
            <li>Cookie</li>
            <li>Giới thiệu Quảng cáo</li>
            <li>Khả năng truy cập</li>
          </ul>
          <p>© 2025 TenSevenMusic AB</p>
        </div>
      </div>
    </div>
  );
}

export default Vip;
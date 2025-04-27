import React from "react";
import '../../pages/client/Vip/Vip.css';// Đảm bảo bạn đã import file CSS
function PremiumCard(props) {
    const {
      title,
      priceOffer,
      priceRegular,
      features,
      buttonText,
      note,
      paymentUrl,
      onButtonClick, // nhận thêm prop này
    } = props;
  
    const handleButtonClick = () => {
      if (onButtonClick) {
        onButtonClick(); // Ưu tiên gọi hàm từ cha
      } else if (paymentUrl) {
        window.open(paymentUrl, '_blank'); // Fallback nếu không có onButtonClick
      } else {
        console.warn("Payment URL is not provided for this plan.");
      }
    };
  
    return (
      <div className="premium-card">
        <div className="premium-card-header">
          <img
            src="https://www.scdn.co/i/_global/favicon.ico"
            alt="Spotify Premium"
            className="premium-logo"
          />
          <p className="premium-text">Premium</p>
        </div>
        <h2 className="premium-plan-name">{title}</h2>
        <div className="premium-price">
          <p className="price-offer">{priceOffer}</p>
          {priceRegular && <p className="price-regular">{priceRegular}</p>}
        </div>
        <ul className="premium-features">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        <button className="premium-button" onClick={handleButtonClick}>
          {buttonText}
        </button>
        <p className="premium-note">
          {note} <a href="#">Terms apply.</a>
        </p>
      </div>
    );
  }
  export default PremiumCard;
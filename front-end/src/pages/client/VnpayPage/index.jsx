import React from 'react';
import { Link } from 'react-router-dom';
import './Vnpay.css';

const IndexPage = ({ title }) => {
  return (
    <div className="panel panel-default">
      <div className="panel-heading">{title}</div>
      <div className="table-responsive">
        <ul className="list-group">
          <li className="list-group-item">
            <Link to="/payment">Demo Thanh toán</Link>
          </li>
          <li className="list-group-item">
            <Link to="/query">Demo Query (Kiểm tra kết quả Giao dịch tại VNPAY)</Link>
          </li>
          <li className="list-group-item">
            <Link to="/refund">Demo Refund (Gửi yêu cầu hoàn tiền cho giao dịch)</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default IndexPage;

import React, { useEffect, useState, useRef } from "react";
import BoxHead from "../../../components/BoxHead";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import BaseTable from "../../../components/BaseTable/BaseTable";
import "./Song.scss";

const tableConfig = {
  columns: [
    { key: "id", header: "ID" },
    { key: "title", header: "Tên bài hát" },
    { key: "singer", header: "Tên ca sĩ" },
    { key: "like", header: "Lượt thích" },
    {
      key: "status",
      header: "Trạng thái hoạt động",
      headerClassName: "status-cell-header",
      className: "status-cell",
      render: (value) => {
        const statusMap = {
          active: { label: "Đang hoạt động", className: "status-green" },
          inactive: { label: "Đã ẩn", className: "status-red" },
        };
        const status = statusMap[value] || { label: value, className: "" };
        return (
          <span className={`${status.className} col-using-render`}>
            {status.label}
          </span>
        );
      },
    },
    {
      key: "isDeleted",
      header: "Trạng thái xóa",
      headerClassName: "status-cell-header",
      className: "status-cell",
      render: (value) => {
        const statusMap = {
          false: { label: "Đang hoạt động", className: "status-green" },
          true: { label: "Đã xóa", className: "status-red" },
        };
        const status = statusMap[value] || { label: value, className: "" };
        return (
          <span className={`${status.className} col-using-render`}>
            {status.label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
    },
    {
      key: "updatedAt",
      header: "Ngày cập nhật",
    },
  ],
  basePath: "/admin/songs",
  filters: [
    {
      id: "status",
      label: "Trạng thái hoạt động",
      options: [
        { value: "", label: "Tất cả" },
        { value: "active", label: "Đang hoạt động" },
        { value: "inactive", label: "Đã ẩn" },
      ],
    },
    {
      id: "isDeleted",
      label: "Trạng thái xóa",
      options: [
        { value: "", label: "Tất cả" },
        { value: "true", label: "Đã xóa" },
        { value: "false", label: "Chưa xóa" },
      ],
    },
  ],
};

const data = [
  {
    id: "SNG001",
    title: "Em của ngày hôm qua",
    singer: "Sơn Tùng M-TP",
    like: "138",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG002",
    title: "Nắng ấm xa dần",
    singer: "Sơn Tùng M-TP",
    like: "140",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG003",
    title: "Cơn mưa ngang qua",
    singer: "Sơn Tùng M-TP",
    like: "200",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG004",
    title: "Đừng về trễ nha",
    singer: "Sơn Tùng M-TP",
    like: "160",
    status: "inactive",
    isDeleted: "true",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG005",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG006",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG007",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG008",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG009",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG010",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG011",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG012",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG013",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG014",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG015",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
  {
    id: "SNG016",
    title: "Khuôn mặt đáng thương",
    singer: "Sơn Tùng M-TP",
    like: "170",
    status: "active",
    isDeleted: "false",
    createdAt: "2021-10-10",
    updatedAt: "2021-10-10",
  },
];

function Song() {
  const [checkedItems, setCheckedItems] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = useRef(10);
  const [offset, setOffset] = useState(0);
  const totalPage = useRef(0);

  useEffect(() => {
    totalPage.current = Math.ceil(data.length / rowsPerPage.current);
  }, []);

  useEffect(() => {
    const initialCheckedItems = data?.reduce((acc, item) => {
      acc[item.id] = false; // Assuming each item has a unique 'id' field
      return acc;
    }, {});

    setCheckedItems(initialCheckedItems);
  }, []);

  return (
    <div className="list-page">
      <div>
        <BoxHead title="Danh sách bài hát" />
      </div>
      <Row>
        <Col>
          <div className="filter-section">
            <div className="filter-header">
              <span>Bộ lọc</span>
            </div>
            <div className="filter-body">
              {tableConfig.filters.map((filter) => (
                <div className="filter-container" key={filter.id}>
                  <Form.Group controlId={filter.id}>
                    <Form.Label>{filter.label}</Form.Label>{" "}
                    {/* Use Form.Label */}
                    <Form.Select
                      className="form-select"
                      id={filter.id}
                      onChange={(e) => console.log(e.target.value)} // Add onChange handler if needed
                    >
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>{" "}
                    {/* Use Form.Select */}
                  </Form.Group>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
      <hr style={{ border: "1.5px solid rgba(46, 38, 61, 0.22)" }} />
      <Row>
        <Col>
          <div className="list-page-header">
            <div className="left">
              <div className="search-box-container">
                <input type="text" placeholder="Search" />
              </div>
            </div>
            <div className="right">
              <Button className="btn add-btn">
                <Plus size={20} />
                Thêm bài hát
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <BaseTable
            data={data}
            columns={tableConfig.columns}
            checkedItems={checkedItems}
            onCheckboxChange={setCheckedItems}
            offset={offset}
            rowsPerPage={rowsPerPage.current}
            currentPage={currentPage}
            totalPages={totalPage.current}
            onPageChange={(page) => {
              setCurrentPage(page);
              setOffset((page - 1) * rowsPerPage.current);
            }}
            basePath={tableConfig.basePath}
          />
        </Col>
      </Row>
    </div>
  );
}

export default Song;

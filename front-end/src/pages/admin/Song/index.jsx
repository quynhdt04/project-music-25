import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import BoxHead from "../../../components/BoxHead";
import { Row, Col, Alert, Spinner } from "react-bootstrap";
import BaseTable from "../../../components/BaseTable/BaseTable";
import { get_all_songs } from "../../../services/SongServices";
import "./Song.scss";

const tableConfig = {
  columns: [
    { key: "id", header: "ID", searchable: true },
    { key: "title", header: "Tên bài hát", searchable: true },
    {
      key: "singer",
      header: "Tên ca sĩ",
      render: (value) => {
        // Assuming `value` is an array of singer names
        if (Array.isArray(value)) {
          return value.join(", "); // Join multiple singers with a comma
        }
        return value; // Fallback for single singer or invalid data
      },
      searchable: true,
    },
    { key: "like", header: "Lượt thích", searchable: true },
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

function Song() {
  const [data, setData] = useState([]);
  const [fetchingStatus, setFetchingStatus] = useState({
    isLoading: true,
    isError: false,
  });

  const fetchData = async () => {
    try {
      setFetchingStatus({ isLoading: true, isError: false });
      const response = await get_all_songs();
      let formattedData = response.data.map((item) => ({
        id: item._id,
        title: item.title,
        singer: item.singers.map((singer) => singer.singerName),
        like: item.like,
        status: item.status,
        isDeleted: item.deleted.toString(),
        createdAt: format(new Date(item.createdAt), "dd/MM/yyyy HH:mm:ss"),
        updatedAt: format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm:ss"),
      }));

      setData(formattedData);
      setFetchingStatus({ isLoading: false, isError: false });
    } catch (error) {
      console.error("Error:", error);
      setFetchingStatus({ isLoading: false, isError: true });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (fetchingStatus.isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Xin vui lòng chờ đợi trong giây lát...</p>
      </div>
    );
  }

  if (fetchingStatus.isError) {
    return <Alert variant="danger">Đã xảy ra lỗi khi tải dữ liệu</Alert>;
  }

  return (
    <div className="list-page">
      <div>
        <BoxHead title="Danh sách bài hát" />
      </div>
      <Row>
        <Col>
          <BaseTable
            data={data}
            columns={tableConfig.columns}
            filters={tableConfig.filters}
            basePath={tableConfig.basePath}
            fetchListData={fetchData}
          />
        </Col>
      </Row>
    </div>
  );
}

export default Song;

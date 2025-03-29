import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import BoxHead from "../../../components/BoxHead";
import { Row, Col, Alert, Spinner } from "react-bootstrap";
import BaseTable from "../../../components/BaseTable/BaseTable";
import { get_all_songs } from "../../../services/SongServices";
import "./Song.scss";
import { tableConfigs } from "../../../utils/constants";

function Song() {
  const [data, setData] = useState([]);
  const [fetchingStatus, setFetchingStatus] = useState({
    isLoading: true,
    isError: false,
  });
  const tableConfig = tableConfigs["songs"];

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
            multipleActions={tableConfig.multipleActions}
            basePath={tableConfig.basePath}
            fetchListData={fetchData}
          />
        </Col>
      </Row>
    </div>
  );
}

export default Song;

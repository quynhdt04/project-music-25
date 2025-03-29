import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import BoxHead from "../../../components/BoxHead";
import { Row, Col, Alert, Spinner } from "react-bootstrap";
import BaseTable from "../../../components/BaseTable/BaseTable";
import {
  get_all_pending_songs,
  get_all_songs,
} from "../../../services/SongServices";
import "./ListPage.scss";
import { tableConfigs } from "../../../utils/constants";
import { get_all_pending_albums } from "../../../services/AlbumServices";

function ListPage() {
  const [data, setData] = useState([]);
  const [fetchingStatus, setFetchingStatus] = useState({
    isLoading: true,
    isError: false,
  });
  const { managementPage } = useParams();
  const tableConfig = tableConfigs[managementPage];

  const fetchData = useCallback(async () => {
    try {
      setFetchingStatus({ isLoading: true, isError: false });
      let response = null;
      let formattedData = null;

      switch (managementPage) {
        case "songs-approval": {
          response = await get_all_pending_songs();
          formattedData = response.data.map((item) => ({
            id: item._id,
            title: item.title,
            singer: item.singers.map((singer) => singer.singerName),
            isPremiumOnly: item.isPremiumOnly.toString(),
            createdBy: item.createdBy,
            status: item.status,
            updatedAt: format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm:ss"),
          }));
          break;
        }

        case "albums-approval": {
          response = await get_all_pending_albums();
          formattedData = response.data.map((item) => ({
            id: item._id,
            title: item.title,
            singer: item.singer.fullName,
            numberOfSongs: item.album_songs.length,
            createdBy: item.createdBy,
            status: item.status,
            updatedAt:
              format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm:ss") ||
              "27/07/2021 12:00:00",
          }));
          break;
        }

        default: {
          response = await get_all_songs();
          formattedData = response.data.map((item) => ({
            id: item._id,
            title: item.title,
            singer: item.singers.map((singer) => singer.singerName),
            like: item.like,
            status: item.status,
            isDeleted: item.deleted.toString(),
            createdAt: format(new Date(item.createdAt), "dd/MM/yyyy HH:mm:ss"),
            updatedAt: format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm:ss"),
          }));
        }
      }

      setData(formattedData);
      setFetchingStatus({ isLoading: false, isError: false });
    } catch (error) {
      console.error("Error:", error);
      setFetchingStatus({ isLoading: false, isError: true });
    }
  }, [managementPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  if (!tableConfig) {
    setFetchingStatus({ isLoading: false, isError: true });
    return null; // Prevent rendering if the config is invalid
  }

  return (
    <div className="list-page">
      <div>
        <BoxHead title={tableConfig.title} />
      </div>
      <Row>
        <Col>
          <BaseTable
            data={data}
            columns={tableConfig.columns}
            filters={tableConfig.filters}
            multipleActions={tableConfig.multipleActions}
            tableActions={tableConfig.tableActions}
            basePath={tableConfig.basePath}
            fetchListData={fetchData}
            canCreateNewData={tableConfig.canCreateNewData}
          />
        </Col>
      </Row>
    </div>
  );
}

export default ListPage;

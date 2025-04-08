import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import BoxHead from "../../../components/BoxHead";
import { Row, Col, Alert, Spinner } from "react-bootstrap";
import BaseTable from "../../../components/BaseTable/BaseTable";
import {
  filter_pending_songs,
  filter_songs,
  get_all_pending_songs,
  get_all_songs,
  search_songs,
} from "../../../services/SongServices";
import "./ListPage.scss";
import { tableConfigs } from "../../../utils/constants";
import {
  filter_albums,
  get_all_albums,
  get_all_pending_albums,
  search_albums,
} from "../../../services/AlbumServices";

function ListPage() {
  const { managementPage } = useParams();
  const tableConfig = tableConfigs[managementPage];
  const [data, setData] = useState([]);
  const [fetchingStatus, setFetchingStatus] = useState({
    isLoading: false,
    isError: false,
  });
  const [filterValues, setFilterValues] = useState(() => {
    const initialValues = {};
    tableConfig.filters?.forEach((filter) => {
      initialValues[filter.id] = "all";
    });
    return initialValues;
  });
  const [searchValue, setSearchValue] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setFetchingStatus({ isLoading: true, isError: false });
      let response = null;
      let formattedData = null;

      switch (managementPage) {
        case "songs-approval": {
          response = await get_all_pending_songs();
          console.log("response", response);
          formattedData = response.data.map((item) => ({
            id: item._id,
            title: item.title,
            singer: item.singers.map((singer) => singer.singerName),
            isPremiumOnly: item.isPremiumOnly,
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
            artist: item.singer.fullName,
            numberOfSongs: item.album_songs.length,
            createdBy: item.createdBy,
            status: item.status,
            updatedAt:
              format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm:ss") ||
              "27/07/2021 12:00:00",
          }));
          break;
        }

        case "albums": {
          response = await get_all_albums();
          formattedData = response.data.map((item) => ({
            id: item._id,
            title: item.title,
            artist: item.singer.fullName,
            numberOfSongs: item.songs.length,
            createdBy: item.creator.username,
            status: item.status,
            isDeleted: item.deleted.toString(),
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

  const handleFilterData = async (value) => {
    try {
      switch (managementPage) {
        case "albums": {
          setFetchingStatus({ isLoading: true, isError: false });
          const filteredData = await filter_albums(value);
          console.log("filteredData", filteredData);
          setData(
            filteredData.data.map((album) => ({
              id: album._id,
              title: album.title,
              artist: album.singer.fullName,
              numberOfSongs: album.songs.length,
              createdBy: album.creator.username,
              status: album.status,
              isDeleted: album.deleted.toString(),
              updatedAt: format(
                new Date(album.updatedAt),
                "dd/MM/yyyy HH:mm:ss"
              ),
            }))
          );
          setFetchingStatus({ isLoading: false, isError: false });
          break;
        }

        case "songs-approval": {
          setFetchingStatus({ isLoading: true, isError: false });
          const filteredData = await filter_pending_songs(value);
          console.log("filteredData", filteredData);
          setData(
            filteredData.data.map((song) => ({
              id: song._id,
              title: song.title,
              singer: song.singers.map((singer) => singer.singerName),
              isPremiumOnly: song.isPremiumOnly.toString(),
              createdBy: song.createdBy,
              status: song.status,
              updatedAt: format(
                new Date(song.updatedAt),
                "dd/MM/yyyy HH:mm:ss"
              ),
            }))
          );
          setFetchingStatus({ isLoading: false, isError: false });
          break;
        }

        default: {
          setFetchingStatus({ isLoading: true, isError: false });
          const filteredData = await filter_songs(value);
          setData(
            filteredData.data.map((song) => ({
              id: song._id,
              title: song.title,
              singer: song.singers.map((singer) => singer.singerName),
              like: song.like,
              status: song.status,
              isDeleted: song.deleted.toString(),
              slug: song.slug,
              createdAt: format(
                new Date(song.createdAt),
                "dd/MM/yyyy HH:mm:ss"
              ),
              updatedAt: format(
                new Date(song.updatedAt),
                "dd/MM/yyyy HH:mm:ss"
              ),
            }))
          );
          setFetchingStatus({ isLoading: false, isError: false });
          break;
        }
      }
    } catch (error) {
      console.log(error);
      setFetchingStatus({ isLoading: false, isError: true });
    }
  };

  const handleSearchData = async (value) => {
    try {
      switch (managementPage) {
        case "albums": {
          setFetchingStatus({ isLoading: true, isError: false });
          const filteredData = await search_albums(value);

          setData(
            filteredData.data.map((album) => ({
              id: album._id,
              title: album.title,
              artist: album.singer.fullName,
              numberOfSongs: album.songs.length,
              createdBy: album.creator.username,
              status: album.status,
              isDeleted: album.deleted.toString(),
              updatedAt: format(
                new Date(album.updatedAt),
                "dd/MM/yyyy HH:mm:ss"
              ),
            }))
          );
          setFetchingStatus({ isLoading: false, isError: false });
          break;
        }

        case "albums-approval": {
          setFetchingStatus({ isLoading: true, isError: false });
          const filteredData = await search_albums(value);
          console.log("filteredData", filteredData);
          setData(
            filteredData.data.map((album) => ({
              id: album._id,
              title: album.title,
              artist: album.singer.fullName,
              numberOfSongs: album.songs.length,
              createdBy: album.creator.username,
              status: album.status,
              updatedAt: format(
                new Date(album.updatedAt),
                "dd/MM/yyyy HH:mm:ss"
              ),
            }))
          );
          setFetchingStatus({ isLoading: false, isError: false });
          break;
        }

        default: {
          setFetchingStatus({ isLoading: true, isError: false });
          const filteredData = await search_songs(value);
          setData(
            filteredData.data.map((song) => ({
              id: song._id,
              title: song.title,
              singer: song.singers.map((singer) => singer.singerName),
              like: song.like,
              status: song.status,
              isDeleted: song.deleted.toString(),
              slug: song.slug,
              createdAt: format(
                new Date(song.createdAt),
                "dd/MM/yyyy HH:mm:ss"
              ),
              updatedAt: format(
                new Date(song.updatedAt),
                "dd/MM/yyyy HH:mm:ss"
              ),
            }))
          );
          setFetchingStatus({ isLoading: false, isError: false });
          break;
        }
      }
    } catch (error) {
      console.log(error);
      setFetchingStatus({ isLoading: false, isError: true });
    }
  };

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
            columns={tableConfig.columns || []}
            filters={tableConfig.filters || []}
            filterValues={filterValues}
            setFilterValues={setFilterValues}
            multipleActions={tableConfig.multipleActions || []}
            tableActions={tableConfig.tableActions}
            basePath={tableConfig.basePath}
            fetchListData={fetchData}
            canCreateNewData={tableConfig.canCreateNewData}
            handleFilterData={handleFilterData}
            handleSearchData={handleSearchData}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
        </Col>
      </Row>
    </div>
  );
}

export default ListPage;

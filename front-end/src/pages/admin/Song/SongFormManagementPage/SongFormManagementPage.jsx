import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import SongForm from "../../../../components/SongForm/SongForm";
import {
  get_latest_song,
  get_song_by_id,
} from "../../../../services/SongServices";
import SongDetailPage from "../SongDetailPage/SongDetailPage";

const SongFormManagementPage = () => {
  const { action, id } = useParams();
  const [data, setData] = useState({});
  const [listDataOption, setListDataOption] = useState({
    singers: [
      { value: "SGR001", label: "Sơn Tùng M-TP" },
      { value: "SGR002", label: "Hồ Ngọc Hà" },
    ],
    topics: [
      { value: "TPC001", label: "Nhạc trẻ" },
      { value: "TPC002", label: "Ballad" },
    ],
  });
  const [fetchingStatus, setFetchingStatus] = useState({
    isLoading: true,
    isError: false,
  });

  const fetchData = useCallback(async () => {
    try {
      let response = null;
      let formattedData = {};
      setFetchingStatus({ isLoading: true, isError: false });
      if (action === "create") {
        response = await get_latest_song();
        formattedData = {
          songId: response.data._id,
          title: response.data.title,
          status: response.data.status,
          deleted: response.data.deleted,
          audio: response.data.audio,
        };
      } else {
        response = await get_song_by_id(id);
        formattedData = {
          songId: response.data._id,
          title: response.data.title,
          avatar: response.data.avatar,
          audio: response.data.audio,
          video: response.data.video,
          description: response.data.description,
          singers: response.data.singers.map((singer) => ({
            value: singer.singerId,
            label: singer.singerName,
          })),
          topics: response.data.topics.map((topic) => ({
            value: topic.topicId,
            label: topic.topicName,
          })),
          like: response.data.like,
          lyrics: response.data.lyrics.map((sentence) => ({
            content: sentence.lyricContent,
            beginAt: sentence.lyricStartTime,
            endAt: sentence.lyricEndTime,
          })),
          status: response.data.status,
          deleted: response.data.deleted,
        };
      }
      setData(formattedData);
      setFetchingStatus({ isLoading: false, isError: false });
    } catch (error) {
      setFetchingStatus({ isLoading: false, isError: true });
      console.error("Error:", error);
    }
  }, [action, id]);

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

  return action === "create" ? (
    <SongForm
      type="create"
      existingSong={data}
      listDataOption={listDataOption}
    />
  ) : action === "edit-info" ? (
    <SongForm
      type="update"
      existingSong={data}
      listDataOption={listDataOption}
    />
  ) : (
    <SongDetailPage song={data} />
  );
};

export default SongFormManagementPage;

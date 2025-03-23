import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import SongForm from "../../../../components/SongForm/SongForm";
import {
  get_latest_song,
  get_song_by_id,
} from "../../../../services/SongServices";
import SongDetailPage from "../SongDetailPage/SongDetailPage";
import { get_all_singers } from "../../../../services/SingerServices";
import { get_all_topics } from "../../../../services/TopicServices";

const SongFormManagementPage = () => {
  const { action, id } = useParams();
  const [data, setData] = useState({});
  const [listDataOption, setListDataOption] = useState({
    singers: [],
    topics: [],
  });
  const [fetchingStatus, setFetchingStatus] = useState({
    isLoading: true,
    isError: false,
  });

  const fetchData = useCallback(async () => {
    try {
      let formattedData = {};
      let singerOptions = [];
      let topicOptions = [];

      setFetchingStatus({ isLoading: true, isError: false });
      if (action === "create") {
        const [latestSongResponse, singersResponse, topicsResponse] =
          await Promise.all([
            get_latest_song(),
            get_all_singers(),
            get_all_topics(),
          ]);

        formattedData = {
          songId: latestSongResponse.data._id,
          title: latestSongResponse.data.title,
          status: latestSongResponse.data.status,
          deleted: latestSongResponse.data.deleted,
          audio: latestSongResponse.data.audio,
        };
        singerOptions = singersResponse.singers.map((singer) => ({
          value: singer.id,
          label: singer.fullName,
        }));
        topicOptions = topicsResponse.topics.map((topic) => ({
          value: topic.id,
          label: topic.title,
        }));
      } else {
        const [songByIdResponse, singersResponse, topicsResponse] =
          await Promise.all([
            get_song_by_id(id),
            get_all_singers(),
            get_all_topics(),
          ]);
        formattedData = {
          songId: songByIdResponse.data._id,
          title: songByIdResponse.data.title,
          avatar: songByIdResponse.data.avatar,
          audio: songByIdResponse.data.audio,
          video: songByIdResponse.data.video,
          description: songByIdResponse.data.description,
          singers: songByIdResponse.data.singers.map((singer) => ({
            value: singer.singerId,
            label: singer.singerName,
          })),
          topics: songByIdResponse.data.topics.map((topic) => ({
            value: topic.topicId,
            label: topic.topicName,
          })),
          like: songByIdResponse.data.like,
          lyrics: songByIdResponse.data.lyrics.map((sentence) => ({
            content: sentence.lyricContent,
            beginAt: sentence.lyricStartTime,
            endAt: sentence.lyricEndTime,
          })),
          status: songByIdResponse.data.status,
          deleted: songByIdResponse.data.deleted,
        };
        singerOptions = singersResponse.singers.map((singer) => ({
          value: singer.id,
          label: singer.fullName,
        }));
        topicOptions = topicsResponse.topics.map((topic) => ({
          value: topic.id,
          label: topic.title,
        }));
      }
      setData(formattedData);
      setListDataOption({
        singers: singerOptions,
        topics: topicOptions,
      });
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

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import AlbumForm from "../../../../components/AlbumForm/AlbumForm";
import {
  get_album_by_id,
  get_latest_album,
} from "../../../../services/AlbumServices";
import { get_all_available_songs } from "../../../../services/SongServices";
import { get_all_singers } from "../../../../services/SingerServices";

const AlbumFormManagement = () => {
  const { action, id } = useParams();
  const [data, setData] = useState({
    albumId: "ALB001",
    title: "Album 1",
  });
  const [listDataOption, setListDataOption] = useState({
    singers: [],
    songs: [],
  });
  const [fetchingStatus, setFetchingStatus] = useState({
    isLoading: false,
    isError: false,
  });

  const fetchData = useCallback(async () => {
    try {
      let formattedData = {};
      let singerOptions = [];
      let songOptions = [];

      setFetchingStatus({ isLoading: true, isError: false });
      if (action === "create") {
        const [latestAlbum, allSongs, allSingers] = await Promise.all([
          get_latest_album(),
          get_all_available_songs(),
          get_all_singers(),
        ]);

        formattedData = {
          albumId: latestAlbum.data?._id || "ALB000",
        };

        singerOptions = allSingers.singers.map((singer) => ({
          value: singer.id,
          label: singer.id,
          fullName: singer.fullName,
        }));
        songOptions = allSongs.data.map((song) => ({
          value: song._id,
          label: song.title,
          artist: song.singers.map((singer) => singer.singerName).join(", "),
          avatar: song.avatar,
          audio: song.audio,
          status: song.status,
          deleted: song.deleted,
        }));
      } else {
        const [albumById, allSingers, allSongs] = await Promise.all([
          get_album_by_id(id),
          get_all_singers(),
          get_all_available_songs(),
        ]);
        formattedData = {
          albumId: albumById.data._id,
          title: albumById.data.title,
          avatar: albumById.data.cover_image,
          singerId: albumById.data.singer._id,
          songs: albumById.data.album_songs.map((song) => ({
            value: song._id,
            label: song.title,
            artist: song.singers.map((singer) => singer.singerName).join(", "),
            avatar: song.avatar,
            audio: song.audio,
          })),
        };
        singerOptions = allSingers.singers.map((singer) => ({
          value: singer.id,
          label: singer.id,
          fullName: singer.fullName,
        }));
        songOptions = allSongs.data.map((song) => ({
          value: song._id,
          label: song.title,
          artist: song.singers.map((singer) => singer.singerName).join(", "),
          avatar: song.avatar,
          audio: song.audio,
          status: song.status,
          deleted: song.deleted,
        }));
      }
      setData(formattedData);
      setListDataOption({
        singers: singerOptions,
        songs: songOptions,
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
    <AlbumForm
      type="create"
      existingAlbum={data}
      listDataOption={listDataOption}
    />
  ) : (
    <AlbumForm
      type="update"
      existingAlbum={data}
      listDataOption={listDataOption}
    />
  );
};

export default AlbumFormManagement;

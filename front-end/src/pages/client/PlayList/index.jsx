import "./PlayList.scss";
import { Link } from "react-router-dom";
import { Col, Row, Modal, Form, Input, Button } from "antd";
import { IoIosAddCircleOutline } from "react-icons/io";
import { PlayCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  create_playList,
  get_all_playList,
  get_play_list_by_id,
  path_playList,
} from "../../../services/PlayListServices";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { get_song_by_id } from "../../../services/SongServices";

function PlayList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  // const user = useSelector((state) => state.authenReducer.user);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [updateState, setUpdateState] = useState(false);
  const MySwal = withReactContent(Swal);
  const {
    playSong,
    currentSong,
    previousSong,
    nextSong,
    addToQueue,
    isPlaying,
    getAudioDuration,
    formatDuration
  } = useMusicPlayer();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handlePlay = async (id) => {
    try {
      const album = await get_play_list_by_id(id);

      if (album.playlist && Array.isArray(album.playlist.songs)) {
        const songIds = album.playlist.songs;

        const songsData = await Promise.all(
          songIds.map(async (songId) => {
            const res = await get_song_by_id(songId);
            const durationSeconds = await getAudioDuration(res.data.audio);

            const formattedDuration = formatDuration(durationSeconds);

            return {
              ...res.data,
              duration: formattedDuration,
            };
          })
        );
        const songsDataWithCover = songsData.map((song) => ({
          ...song,
          cover: song.avatar || "/default-album.jpg",
          artist: song.singers.map((item) => item.singerName).join(", "),
        }));

        if (songsDataWithCover.length > 0) {
          playSong(songsDataWithCover[0]);
          addToQueue([...songsDataWithCover]);
        } else {
          console.log("Playlist rỗng");
        }
      } else {
        console.log("Không có danh sách bài hát trong playlist");
      }
    } catch (error) {
      console.error("Lỗi khi play:", error);
    }
  };

  const handleDel = async (id) => {
    MySwal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa album này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const result = await path_playList(id, { deleted: true });
        if (result.message) {
          setUpdateState(!updateState);
          Swal.fire("Thành công!", "Album đã được xóa.", "success");
        } else {
          Swal.fire("Thất bại!", "Không thể xóa Album.", "error");
        }
      }
    });
  };

  console.log("user", user);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const result = await get_all_playList();
  
        const playlistsWithAvatars = await Promise.all(
          result.playList.map(async (playlist) => {
            let firstSongAvatar = "";
  
            if (playlist.songs && playlist.songs.length > 0) {
              const firstSongId = playlist.songs[0];
              const song = await get_song_by_id(firstSongId);
              firstSongAvatar = song?.data?.avatar || "";
            }
  
            return {
              ...playlist,
              firstSongAvatar, 
            };
          })
        );
  
        setData(playlistsWithAvatars);
      } catch (error) {
        console.error("Lỗi khi tải danh sách playlist:", error);
      }
    };
  
    fetchApi();
  }, [updateState]);

  const handleCreatePlaylist = async (e) => {
    const title = e.playlistName;
    const data = {
      userId: user.id,
      title: title,
      imageAlbum: "",
      songs: [],
    };

    const result = await create_playList(data);

    if (result.message) {
      form.resetFields();
      setIsModalOpen(false);
      setUpdateState(!updateState);
    }
  };

  return (
    <>
      <Row className="play-list">
        <Col
          xs={12}
          sm={12}
          md={6}
          lg={6}
          xl={4}
          className="play-list__col create"
          onClick={showModal}
        >
          <IoIosAddCircleOutline />
          <p>Tạo Playlist mới</p>
        </Col>

        <Modal
          title="Tạo Playlist mới"
          footer={null}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          className="play-list__modal"
        >
          <Form layout="vertical" form={form} onFinish={handleCreatePlaylist}>
            <Form.Item
              name="playlistName"
              rules={[
                { required: true, message: "Vui lòng nhập tên album!" },
                { max: 50, message: "Tên album tối đa 50 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên album..." />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Tạo Playlist
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {data &&
          data.map((item) => (
            <Col
              xs={12}
              sm={12}
              md={6}
              lg={6}
              xl={4}
              className="play-list__col"
              key={item.id}
            >
              <Link to={`/playlist/detail/${item.id}`}>
                <div className="img-wrapper">
                  <img
                    src={
                      item.firstSongAvatar !== ""
                        ? item.firstSongAvatar
                        : "../../../../public/image/album_default.png"
                    }
                    alt=""
                  />
                </div>
                <p>{item.title}</p>
                {/* <p className="name">{user.fullName}</p> */}
              </Link>
              <div className="play-list__icon">
                <CloseOutlined
                  className="close"
                  onClick={() => handleDel(item.id)}
                />
                <PlayCircleOutlined
                  className="play"
                  onClick={() => handlePlay(item.id)}
                />
              </div>
            </Col>
          ))}
      </Row>
    </>
  );
}

export default PlayList;

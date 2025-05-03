import { IoMdMusicalNotes } from "react-icons/io";
import { LuRefreshCcw } from "react-icons/lu";
import { FaHeart, FaPlay } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoAddOutline } from "react-icons/io5";
import DropupMenu from "../../../components/DropupMenu";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  add_song_to_playlist,
  get_play_list_by_id,
} from "../../../services/PlayListServices";
import { get_all_songs, get_song_by_id, update_song_like_view } from "../../../services/SongServices";
import { useSelector } from "react-redux";
import {
  create_favoriteSong,
  get_favoriteSong,
} from "../../../services/FavoriteSongServices";
import useMusicPlayer from "../../../hooks/useMusicPlayer";

function PlayListDetail() {
  const params = useParams();
  const [data, setData] = useState([]);
  const [randomSongs, setRandomSongs] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [refreshFavoriteSong, setRefreshFavoriteSong] = useState(false);
  const [refreshAddSong, setRefreshAddSong] = useState(false);
  const [refreshUpdate, setRefreshUpdate] = useState(false);
  const [totalDuration, setTotalDuration] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [firstAvatar, setFirstAvatar] = useState("");
  const [album, setAlbum] = useState([]);
  const user = useSelector((state) => state.authenReducer.user);
  // const user = JSON.parse(sessionStorage.getItem("user"));
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue, getAudioDuration, formatDuration } =
    useMusicPlayer();

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const album = await get_play_list_by_id(params.id);
        const favoriteSongs = await get_favoriteSong(user.id);
        let totalDurationSeconds = 0;
        setAlbum(album);

        const songDetails = await Promise.all(
          album.playlist.songs.map(async (songId) => {
            const song = await get_song_by_id(songId);
            const durationSeconds = await getAudioDuration(song.data.audio);
            totalDurationSeconds += durationSeconds;
            // console.log("durationSeconds", durationSeconds, song.data)
            // console.log("album", album);

            const formattedDuration = formatDuration(durationSeconds);

            return {
              ...song.data,
              cover: song.data.avatar,
              artist: song.data.singers.map((item) => item.singerName).join(", "),
              duration: formattedDuration,
              isFavorite: favoriteSongs.songs.includes(song.data.id),
            };
          })
        );

        setData(songDetails);
        setTotalDuration(formatDuration(totalDurationSeconds));
        setAlbumTitle(album.playlist.title);
        if (songDetails.length > 0) {
          setFirstAvatar(songDetails[0].cover);
        }
      } catch (e) {
        console.error("Lỗi khi tải playlist:", e);
      }
    };

    fetchApi();
  }, [refreshFavoriteSong, refreshAddSong, refreshUpdate]);

  useEffect(() => {
    const fetchRandomSongs = async () => {
      try {
        const allSongs = await get_all_songs();

        const existingSongIds =
          data.length > 0 ? data.map((song) => song.data?.id ?? song._id) : [];

        const filteredSongs = allSongs.data.filter(
          (song) => !existingSongIds.includes(song._id)
        );

        const songsToPickFrom =
          filteredSongs.length > 0 ? filteredSongs : allSongs.data;
        const shuffled = songsToPickFrom.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        const favoriteSongs = await get_favoriteSong(user.id);
        const favoriteSongIds = favoriteSongs?.songs || []; // đảm bảo là mảng

        let dataUpdate = selected.map((song) => ({
          ...song,
          isFavorite: favoriteSongIds.includes(song._id),
        }))

        dataUpdate = await Promise.all(dataUpdate.map(async (song) => {
          const durationSeconds = await getAudioDuration(song.audio);
          const formattedDuration = formatDuration(durationSeconds);
          return {
            ...song,
            duration: formattedDuration,
          };
        }));

        // console.log("dataUpdate", dataUpdate)

        setRandomSongs(dataUpdate);
      } catch (e) {
        console.error(e)
      }
    };

    fetchRandomSongs();
  }, [refresh]);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  const handleFavorite = async (id) => {
    const songID = id;
    const userID = user.id;

    try {
      const result = await create_favoriteSong({
        userId: userID,
        songId: songID,
      });

      if (result?.action) {
        const isLiked = result.action === "added"; 

        const requestData = {
          songId: songID,
          isLike: isLiked,
        };

        const resultLike = await update_song_like_view(requestData);
        if (resultLike?.status === "success") {
          console.log(isLiked ? "Đã thêm vào yêu thích" : "Đã gỡ khỏi yêu thích");
        } else {
          console.error("Lỗi khi cập nhật lượt thích:", resultLike?.message);
        }

        setRefreshFavoriteSong(!refreshFavoriteSong);
      } else {
        console.error("Không có hành động yêu thích từ API");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào yêu thích:", error);
    }
  };


  const handleAddSong = async (newSongId) => {
    try {
      const result = await add_song_to_playlist(params.id, {
        songId: newSongId,
      });
      setRefreshAddSong(!refreshAddSong);
      console.log("Kết quả cập nhật:", result);
    } catch (error) {
      console.error("Lỗi khi thêm bài hát vào playlist:", error);
    }
  };

  const handlePlayAllClick = (e) => {
    e.preventDefault();

    if (
      currentSong &&
      data.some((song) => song.id === currentSong.id) &&
      isPlaying
    ) {
      togglePlay();
    } else {
      playSong(data[0]);
      addToQueue([...data]);
    }
  };

  const handlePlayClick = (e, song) => {
    e.preventDefault();

    if (currentSong && currentSong.id === song.id) {
      togglePlay();
    } else {
      playSong(song);
      addToQueue(song);
    }
  };

  // console.log(data);

  return (
    <>
      <div className="playlist">
        <div className="playlist__info">
          <div className="playlist__cover">
            <img
              src={firstAvatar || "../../../../public/image/album_default.png"}
              alt=""
            />
          </div>
          <div className="playlist__details">
            <h2>{albumTitle}</h2>
            <p>
              Tạo bởi <strong>{user.fullName}</strong>
            </p>
            <button className="play-btn" onClick={handlePlayAllClick}>
              {" "}
              <FaPlay /> Tiếp tục phát
            </button>
            <DropupMenu album={album.playlist} refreshUpdate={refreshUpdate} setRefreshUpdate={setRefreshUpdate} />
          </div>
        </div>

        <div className="playlist__music">
          {data.length <= 0 ? (
            <>
              <div className="playlist__list-null">
                <IoMdMusicalNotes />
                <h4>Không có bài hát nào trong danh sách này</h4>
              </div>
            </>
          ) : (
            <>
              <div className="playlist__list">
                <div className="playlist__header">
                  <span>BÀI HÁT</span>
                  <span>ALBUM</span>
                  <span>THỜI GIAN</span>
                </div>
                {data.map((item) => (
                  <div className="playlist__song" key={item.id}>
                    <div className="playlist__song-info">
                      <div className="playlist__thumbnail-wrapper">
                        <img
                          src={item.avatar || "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/hinh-nen-de-thuong.jpg"}
                          alt={item.title}
                          className="playlist__thumbnail"
                        />
                        <div className="playlist__play-icon" onClick={(e) => {
                          const formattedData = {
                            ...item,
                            cover: item.avatar,
                            artist: item.singers
                              .map((item) => item.singerName)
                              .join(", "),
                          }
                          handlePlayClick(e, formattedData)
                        }}>
                          <FaPlay />
                        </div>
                      </div>
                      <div className="playlist__details">
                        <h4 className="playlist__title">{item.title}</h4>
                        <p className="playlist__artists">{
                          item.singers
                            .map((item) => item.singerName)
                            .join(", ") || ""
                        }</p>
                      </div>
                    </div>
                    <span className="playlist__album">
                      {item.albums?.map((item) => item.title).join(", ") || ""}
                    </span>
                    <span className="playlist__duration">{item.duration}</span>
                    <div className="playlist__actions">
                      <FaHeart
                        className={item.isFavorite ? "heart-color" : ""}
                        onClick={() => handleFavorite(item.id)}
                      />
                      <RiDeleteBin6Line />
                    </div>
                  </div>
                ))}
                <div className="playlist__footer">
                  <span>{data.length} bài hát • {totalDuration} phút</span>
                </div>
              </div>
            </>
          )}

          <div className="suggested-songs">
            <div className="suggested-songs__header">
              <h3>Bài Hát Gợi Ý</h3>
              <button onClick={handleRefresh}>
                <LuRefreshCcw /> Làm mới
              </button>
            </div>

            {randomSongs &&
              randomSongs.map((item) => (
                <div className="playlist__song" key={item._id}>
                  <div className="playlist__song-info">
                    <div className="playlist__thumbnail-wrapper">
                      <img
                        src={item.avatar || "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/hinh-nen-de-thuong.jpg"}
                        alt="Mặt Mộc"
                        className="playlist__thumbnail"
                      />
                      <div className="playlist__play-icon" onClick={(e) => {
                        const formattedData = {
                          ...item,
                          id: item._id,
                          cover: item.avatar,
                          artist: item.singers
                            .map((item) => item.singerName)
                            .join(", "),
                        }
                        handlePlayClick(e, formattedData)
                      }}>
                        <FaPlay />
                      </div>
                    </div>
                    <div className="playlist__details">
                      <h4 className="playlist__title">{item.title}</h4>
                      <p className="playlist__artists">
                        {item.singers
                          ?.map((singer) => singer.singerName)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                  <span className="playlist__album">{item.albums?.map((item) => item.title).join(", ") || ""}</span>
                  <span className="playlist__duration">{item.duration}</span>
                  <div className="playlist__actions">
                    <FaHeart
                      className={item.isFavorite ? "heart-color" : ""}
                      onClick={() => handleFavorite(item._id)}
                    />
                    <IoAddOutline onClick={() => handleAddSong(item._id)} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default PlayListDetail;

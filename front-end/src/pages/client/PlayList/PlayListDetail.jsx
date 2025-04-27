import { IoMdMusicalNotes } from "react-icons/io";
import { LuRefreshCcw } from "react-icons/lu";
import { FaHeart, FaPlay } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoAddOutline } from "react-icons/io5";
import DropupMenu from "../../../components/DropupMenu";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { add_song_to_playlist, get_play_list_by_id } from "../../../services/PlayListServices";
import { get_all_songs, get_song_by_id } from "../../../services/SongServices";
import { useSelector } from "react-redux";
import { create_favoriteSong, get_favoriteSong } from "../../../services/FavoriteSongServices";

function PlayListDetail() {

    const params = useParams();
    const [data, setData] = useState([]);
    const [randomSongs, setRandomSongs] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [refreshFavoriteSong, setRefreshFavoriteSong] = useState(false);
    const [refreshAddSong, setRefreshAddSong] = useState(false);
    const user = useSelector((state) => state.authenReducer.user);

    const getAudioDuration = (audioUrl) => {
        return new Promise((resolve) => {
            const audio = new Audio();

            audio.addEventListener("error", () => {
                console.error("Error loading audio:", audioUrl);
                resolve(0);
            });

            const timeout = setTimeout(() => {
                console.warn("Audio metadata loading timed out:", audioUrl);
                resolve(0);
            }, 5000);

            audio.addEventListener("loadedmetadata", () => {
                clearTimeout(timeout);
                resolve(audio.duration);
            });

            audio.src = audioUrl;
        });
    };

    const formatDuration = (seconds) => {
        if (!seconds || isNaN(seconds)) return "00:00";

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    useEffect(() => {
        const fetchApi = async () => {
            const album = await get_play_list_by_id(params.id);
            const favoriteSongs = await get_favoriteSong(user.id);


            const songDetails = await Promise.all(
                album.playlist.songs.map(async (songId) => {
                    const song = await get_song_by_id(songId);
                    console.log("Thông tin bài hát vừa fetch:", song);
                    
                    const durationSeconds = await getAudioDuration(song.audio);

                    const formattedDuration = formatDuration(durationSeconds);

                    console.log("Duration dạng giây:", durationSeconds); 
                    console.log("Duration đã format:", formattedDuration);
                    return {
                        ...song,
                        duration: formattedDuration, 
                    };
                })
            );

            const updatedSongs = songDetails.map((song) => ({
                ...song,
                data: {
                    ...song.data,
                    isFavorite: favoriteSongs.songs.includes(song.data._id)
                }
            }));

            setData(updatedSongs);
        };
        fetchApi();
    }, [refreshFavoriteSong, refreshAddSong]);
    console.log(data);

    useEffect(() => {
        const fetchRandomSongs = async () => {
            const allSongs = await get_all_songs();

            const existingSongIds = data.length > 0
                ? data.map(song => song.data?._id ?? song._id)
                : [];

            const filteredSongs = allSongs.data.filter(
                song => !existingSongIds.includes(song._id)
            );

            const songsToPickFrom = filteredSongs.length > 0 ? filteredSongs : allSongs.data;
            const shuffled = songsToPickFrom.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);

            const favoriteSongs = await get_favoriteSong(user.id);
            const favoriteSongIds = favoriteSongs?.songs || []; // đảm bảo là mảng

            const dataUpdate = selected.map((song) => ({
                ...song,
                isFavorite: favoriteSongIds.includes(song._id),
            }));

            setRandomSongs(dataUpdate);
        };

        fetchRandomSongs();
    }, [data, refresh]);


    const handleRefresh = () => {
        setRefresh(!refresh);
    }

    const handleFavorite = async (id) => {
        const songID = id;
        const userID = user.id;
        try {
            const result = await create_favoriteSong({
                userId: userID,
                songId: songID,
            });
            setRefreshFavoriteSong(!refreshFavoriteSong);

            console.log("Yêu thích thành công:", result);
        } catch (error) {
            console.error("Lỗi khi thêm vào yêu thích:", error);
        }
    }

    const handleAddSong = async (newSongId) => {
        try {
            const result = await add_song_to_playlist(params.id, {
                songId: newSongId
            });
            setRefreshAddSong(!refreshAddSong);
            console.log("Kết quả cập nhật:", result);
        } catch (error) {
            console.error("Lỗi khi thêm bài hát vào playlist:", error);
        }
    };


    return (
        <>
            <div className="playlist">
                <div className="playlist__info">
                    <div className="playlist__cover">
                        <img src="https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/hinh-nen-de-thuong.jpg" alt="" />
                    </div>
                    <div className="playlist__details">
                        <h2>Name</h2>
                        <p >Tạo bởi <strong>Đinh Quỳnh</strong></p>
                        <button className="play-btn"> <FaPlay /> Tiếp tục phát</button>
                        <DropupMenu />
                    </div>
                </div>

                <div className="playlist__music">
                    {data.length <= 0 ? (<>
                        <div className="playlist__list-null" >
                            <IoMdMusicalNotes />
                            <h4>Không có bài hát nào trong danh sách này</h4>
                        </div>
                    </>) : (<>
                        <div className="playlist__list">
                            <div className="playlist__header">
                                <span>BÀI HÁT</span>
                                <span>ALBUM</span>
                                <span>THỜI GIAN</span>
                            </div>
                            {data.map(item => (
                                <div className="playlist__song" key={item.data._id}>
                                    <div className="playlist__song-info">
                                        <div className="playlist__thumbnail-wrapper">
                                            <img src={item.data.avatar}
                                                alt={item.data.title} className="playlist__thumbnail" />
                                            <div className="playlist__play-icon">
                                                <FaPlay />
                                            </div>
                                        </div>
                                        <div className="playlist__details">
                                            <h4 className="playlist__title">{item.data.title}</h4>
                                            <p className="playlist__artists"></p>
                                        </div>
                                    </div>
                                    <span className="playlist__album">{item.data.album?.title || ""}</span>
                                    <span className="playlist__duration">{item.duration}</span>
                                    <div className="playlist__actions">
                                        <FaHeart className={item.data.isFavorite ? "heart-color" : ""} onClick={() => handleFavorite(item.data._id)} />
                                        <RiDeleteBin6Line />
                                    </div>
                                </div>
                            ))}
                            <div className="playlist__footer">
                                <span>{data.length} bài hát • 3 phút</span>
                            </div>
                        </div>
                    </>)}


                    <div className="suggested-songs">
                        <div className="suggested-songs__header">
                            <h3>Bài Hát Gợi Ý</h3>
                            <button onClick={handleRefresh}>
                                <LuRefreshCcw /> Làm mới
                            </button>
                        </div>

                        {randomSongs && (
                            randomSongs.map(item => (
                                <div className="playlist__song" key={item._id}>
                                    <div className="playlist__song-info">
                                        <div className="playlist__thumbnail-wrapper">
                                            <img src="https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/hinh-nen-de-thuong.jpg"
                                                alt="Mặt Mộc" className="playlist__thumbnail" />
                                            <div className="playlist__play-icon">
                                                <FaPlay />
                                            </div>
                                        </div>
                                        <div className="playlist__details">
                                            <h4 className="playlist__title">{item.title}</h4>
                                            <p className="playlist__artists">{item.singers?.map(singer => singer.singerName).join(', ')}</p>
                                        </div>
                                    </div>
                                    <span className="playlist__album">Mặt Mộc (Single)</span>
                                    <span className="playlist__duration">03:24</span>
                                    <div className="playlist__actions">
                                        <FaHeart className={item.isFavorite ? "heart-color" : ""} onClick={() => handleFavorite(item._id)} />
                                        <IoAddOutline onClick={() => handleAddSong(item._id)} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div >
        </>
    )
}

export default PlayListDetail;
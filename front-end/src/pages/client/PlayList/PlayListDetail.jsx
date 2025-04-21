import { IoMdMusicalNotes } from "react-icons/io";
import { LuRefreshCcw } from "react-icons/lu";
import { FaHeart, FaPlay } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoAddOutline } from "react-icons/io5";
import DropupMenu from "../../../components/DropupMenu";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { get_play_list_by_id } from "../../../services/PlayListServices";
import { get_all_songs, get_song_by_id } from "../../../services/SongServices";
import { useSelector } from "react-redux";
import { create_favoriteSong } from "../../../services/FavoriteSongServices";

function PlayListDetail() {

    const params = useParams();
    const [data, setData] = useState([]);
    const [randomSongs, setRandomSongs] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const user = useSelector((state) => state.authenReducer.user);


    useEffect(() => {
        const fetchApi = async () => {
            const album = await get_play_list_by_id(params.id);
            const songDetails = await Promise.all(
                album.playlist.songs.map((songId) => get_song_by_id(songId))
            );
            setData(songDetails);
        }
        fetchApi();
    }, []);

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

            setRandomSongs(selected);
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

            console.log("Yêu thích thành công:", result);
        } catch (error) {
            console.error("Lỗi khi thêm vào yêu thích:", error);
        }
    }
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
                                                alt="Mặt Mộc" className="playlist__thumbnail" />
                                            <div className="playlist__play-icon">
                                                <FaPlay />
                                            </div>
                                        </div>
                                        <div className="playlist__details">
                                            <h4 className="playlist__title"></h4>
                                            <p className="playlist__artists"></p>
                                        </div>
                                    </div>
                                    <span className="playlist__album">Mặt Mộc (Single)</span>
                                    <span className="playlist__duration">03:24</span>
                                    <div className="playlist__actions">
                                        <FaHeart onClick={() => handleFavorite(item.data._id)} />
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
                                        <FaHeart />
                                        <IoAddOutline />
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
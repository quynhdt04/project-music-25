import { useEffect, useState } from "react";
import { get_singer_by_id } from "../../../services/SingerServices";
import { get_songs_by_singerID } from "../../../services/ArtistServices";
import { Link } from "react-router-dom";
import "./artistDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { FaCheckCircle, FaPlay } from 'react-icons/fa';
import { Heart, HeartFill } from "react-bootstrap-icons";
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { create_favoriteSong, get_favoriteSong } from "../../../services/FavoriteSongServices";
import { toast } from "react-toastify";

function ArtistDetail() {
    const { id: singerId } = useParams();
    const [songs, setSongs] = useState([]);
    const navigate = useNavigate();
    const [singerData, setSingerData] = useState({
        fullName: "",
        avatar: "",
        status: "active",
    });
    const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = useMusicPlayer();
    const [likedSongs, setLikedSongs] = useState([]);
    const user = JSON.parse(sessionStorage.getItem("user"));

    const formatTime = (dateString) => {
        if (!dateString) return "00:00";
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    useEffect(() => {
        const fetchSinger = async () => {
            try {
                const response = await get_singer_by_id(singerId);
                if (response && response.singer) {
                    setSingerData(response.singer);
                } else {
                    console.error("Không tìm thấy thông tin ca sĩ!");
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin ca sĩ:", error);
            }
        };

        const fetchSongs = async () => {
            try {
                const response = await get_songs_by_singerID(singerId);
                if (response && response.songs) {
                    setSongs(response.songs);
                } else {
                    console.error("Không tìm thấy bài hát của ca sĩ!");
                }
            } catch (error) {
                console.error("Lỗi khi lấy bài hát của ca sĩ:", error);
            }
        };

        const fetchLikedSongs = async () => {
            if (user) {
                try {
                    const response = await get_favoriteSong(user.id);
                    if (response && response.songs) {
                        setLikedSongs(response.songs);
                    }
                } catch (error) {
                    console.error("Lỗi khi lấy danh sách bài hát yêu thích:", error);
                }
            }
        };

        fetchSinger();
        fetchSongs();
        fetchLikedSongs();
    }, [singerId, user]);

    const handlePlayClick = (e, song) => {
        e.preventDefault();
        const formattedData = {
            ...song,
            cover: song.avatar,
            artist: singerData.fullName,
            id: song._id
        };

        if (currentSong && currentSong.id === formattedData.id) {
            togglePlay();
        } else {
            playSong(formattedData);
            addToQueue(formattedData);
        }
    };

    const handleLikeClick = async (songId) => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để thực hiện chức năng này!");
            return;
        }

        try {
            const result = await create_favoriteSong({
                userId: user.id,
                songId: songId,
            });

            if (result?.action) {
                const isLiked = result.action === "added";
                setLikedSongs(prev =>
                    isLiked
                        ? [...prev, songId]
                        : prev.filter(id => id !== songId)
                );
            }
        } catch (error) {
            console.error("Lỗi khi thực hiện thao tác yêu thích:", error);
        }
    };

    return (
        <>
            <div className="artist-detail">
                <div className="singer-info">
                    <div className="d-flex align-items-center aritis-wraper">
                        <img
                            src={singerData.avatar || "default-avatar.jpg"}
                            alt="avatar"
                            className="rounded-circle m-4 shadow-lg"
                            width="180"
                            height="180"
                        />
                        <div className="ms-5">
                            <p className="text-white" style={{ fontSize: '20px' }}>
                                <FaCheckCircle style={{ marginRight: '10px' }} />
                                Nghệ sĩ được xác minh
                            </p>
                            <h1 className="fw-bold display-4 text-white">{singerData.fullName}</h1>
                            <div className="ms-2" onClick={() => navigate(-1)}>
                                <IoArrowBackCircleOutline
                                    title="Trở về"
                                    size={25}
                                    className="text-white auto-bounce"
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="songs-list">
                    <h3 className="p-3 text-white">Danh sách bài hát</h3>
                    {songs.length > 0 ? (
                        <ul className="list-unstyled ms-4">
                            {songs.map((song, index) => (
                                <li key={song._id}>
                                    <div className="item-song d-flex align-items-center p-2">
                                        <div className="song-number me-3">
                                            <p className="me-3 mb-0 fw-bold text-white">{index + 1}</p>
                                        </div>
                                        <div className="song-thumbnail"
                                            onClick={(e) => handlePlayClick(e, song)}>
                                            <img
                                                src={song.avatar || "default-song.jpg"}
                                                alt="img"
                                                className="me-3 rounded"
                                            />
                                            <div className="play-overlay">
                                                <FaPlay />
                                            </div>
                                        </div>
                                        <p className="ms-3 text-white">{song.title}</p>
                                        <div className="like-container ms-auto d-flex align-items-center">
                                            <button
                                                className={`heart-icon me-2 ${likedSongs.includes(song._id) ? "liked" : ""}`}
                                                onClick={() => handleLikeClick(song._id)}
                                            >
                                                {likedSongs.includes(song._id) ? <HeartFill color="red" /> : <Heart color="red" />}
                                            </button>
                                            <span className="like-count text-white-50 ms-4">{formatTime(song.createdAt)}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-white ms-4">Không có bài hát nào.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default ArtistDetail;

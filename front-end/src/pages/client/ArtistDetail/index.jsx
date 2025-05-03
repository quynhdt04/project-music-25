import { useEffect, useState } from "react";
import { get_singer_by_id } from "../../../services/SingerServices";
import { get_songs_by_singerID } from "../../../services/ArtistServices";
import { Link } from "react-router-dom";
import "./artistDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { FaCheckCircle } from 'react-icons/fa';

function ArtistDetail() {
    const { id: singerId } = useParams(); // Lấy singerId từ URL params
    const [songs, setSongs] = useState([]); // State để lưu danh sách bài hát
    const navigate = useNavigate();
    const [singerData, setSingerData] = useState({
        fullName: "",
        avatar: "",
        status: "active",
    });

    useEffect(() => {
        const fetchSinger = async () => {
            try {
                // Lấy thông tin ca sĩ
                const response = await get_singer_by_id(singerId);
                console.log(response);
                if (response && response.singer) {
                    setSingerData(response.singer);
                } else {
                    console.error("Không tìm thấy thông tin ca sĩ!");
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin ca sĩ:", error);
            }
        };

        // Lấy danh sách bài hát của ca sĩ
        const fetchSongs = async () => {
            try {
                const response = await get_songs_by_singerID(singerId);
                console.log(response);
                if (response && response.songs) {
                    setSongs(response.songs); // Cập nhật state với danh sách bài hát
                } else {
                    console.error("Không tìm thấy bài hát của ca sĩ!");
                }
            } catch (error) {
                console.error("Lỗi khi lấy bài hát của ca sĩ:", error);
            }
        };

        fetchSinger(); // Lấy thông tin ca sĩ
        fetchSongs(); // Lấy bài hát của ca sĩ
    }, [singerId]);

    return (
        <>
            <div className="artist-detail">
                <div className="singer-info">
                    <div className="d-flex align-items-center aritis-wraper">
                        <img
                            src={singerData.avatar}
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
                                <IoArrowBackCircleOutline title="Trở về" size={25} className="text-white auto-bounce"
                                    style={{ cursor: "pointer" }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="songs-list">
                    <h3 className="p-4 text-white">Danh sách bài hát</h3>
                    {songs.length > 0 ? (
                        <ul className="list-unstyled ms-4">
                            {songs.map((song, index) => (
                                <li key={song._id}>
                                    <div className="item-song d-flex align-items-center mb-3">
                                        <p className="me-3 mb-0 fw-bold text-white">{index + 1}</p>
                                        <img
                                            src={song.avatar}
                                            alt="img"
                                            className="me-3 rounded"
                                            style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                        />
                                        <p className="mb-0 text-white">{song.title}</p>
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

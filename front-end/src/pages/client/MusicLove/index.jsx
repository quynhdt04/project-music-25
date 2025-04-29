import React, { useEffect, useState } from "react";
import { Row, Col, Avatar } from "antd";
import { HeartFilled, PlayCircleOutlined } from "@ant-design/icons";
import { get_favoriteSong } from "../../../services/FavoriteSongServices";
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { get_song_by_id } from "../../../services/SongServices";


const MusicLove = () => {
    const [hoveredRow, setHoveredRow] = useState(null);
    const [favorite, setFavorite] = useState({});
    const [data, setData] = useState([]);
    const user = JSON.parse(sessionStorage.getItem("user"));
    const { currentSong, isPlaying, playSong, togglePlay, addToQueue, getAudioDuration, formatDuration } =
    useMusicPlayer();


    useEffect(() => {
        const fetchApi = async () => {
            const favoriteSongs = await get_favoriteSong(user.id);

            const songDetails = await Promise.all(
                favoriteSongs.songs.map(async (songId) => {
                    const song = await get_song_by_id(songId);
                    
                    const durationSeconds = await getAudioDuration(song.data.audio);
                    const formattedDuration = formatDuration(durationSeconds);
                    return {
                        ...song.data,
                        cover: song.data.avatar,
                        artist: song.data.singers.map((item) => item.singerName).join(", "),
                        duration: formattedDuration,
                        albumTitles: song.data.albums?.map(album => album.title).join(", ") || "",
                      };
                })
            )
            setData(songDetails);
        }
        fetchApi();
    },[])

    const toggleFavorite = (key) => {
        console.log("key", key)
        setFavorite((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div style={{ backgroundColor: "#170F23", padding: "20px", borderRadius: "10px" }}>
            <Row align="middle" style={{ padding: "10px 0", borderBottom: "2px solid #555", fontWeight: "bold", color: "#fff" }}>
                <Col span={12}>BÀI HÁT</Col>
                <Col span={8}>ALBUM</Col>
                <Col span={4} style={{ textAlign: "center" }}>THỜI GIAN</Col>
            </Row>
            {data.map((item) => (
                <Row 
                    key={item.id} 
                    align="middle" 
                    style={{ 
                        padding: "10px 0", 
                        borderBottom: "1px solid #333", 
                        position: "relative", 
                        backgroundColor: hoveredRow === item.id ? "#2F2739" : "transparent",
                        transition: "background-color 0.3s"
                    }}
                    onMouseEnter={() => setHoveredRow(item.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                >
                    <Col span={12} style={{ display: "flex", alignItems: "center", position: "relative" }}>
                        <Avatar src={item.avatar} shape="square" size={50} style={{ marginRight: 10, position: "relative" }} />
                        {hoveredRow === item.id && (
                            <PlayCircleOutlined 
                                style={{ 
                                    position: "absolute", 
                                    left: 25, 
                                    top: "50%", 
                                    transform: "translate(-50%, -50%)", 
                                    fontSize: 24, 
                                    color: "#fff", 
                                    cursor: "pointer" 
                                }}
                            />
                        )}
                        <div>
                            <div style={{ fontWeight: "bold", color: "#fff" }}>{item.title}</div>
                            <div style={{ color: "gray", fontSize: "12px" }}>{item.artist}</div>
                        </div>
                    </Col>
                    <Col span={8} style={{ color: "#fff" }}>{item.albumTitles || ""}</Col>
                    <Col span={4} style={{ textAlign: "center", color: "#fff" }}>
                        <HeartFilled 
                            style={{ 
                                marginRight: 8, 
                                color: favorite[item.id] ? "gray" : "#ff4d4f", 
                                cursor: "pointer" 
                            }} 
                            onClick={() => toggleFavorite(item.id)}
                        />
                        {item.duration}
                    </Col>
                </Row>
            ))}
        </div>
    );
};

export default MusicLove;

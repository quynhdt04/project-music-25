import React, { useEffect, useState } from 'react';
import { Column } from '@ant-design/plots';
import { get_song_top_play } from '../../../services/SongServices';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { HeartFilled, MoreOutlined, PlayCircleOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import { create_favoriteSong, get_favoriteSong } from '../../../services/FavoriteSongServices';
import { toast, Bounce } from "react-toastify";

const BXH = () => {
    const { currentSong, isPlaying, playSong, togglePlay, addToQueue, getAudioDuration, formatDuration } =
        useMusicPlayer();
    const [data, setData] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const user = JSON.parse(sessionStorage.getItem("user"));

    useEffect(() => {
        const fetchAPI = async () => {
            const result = await get_song_top_play();

            let favoriteSongIds = [];
            if (user) {
                const favoriteSongs = await get_favoriteSong(user.id);
                favoriteSongIds = favoriteSongs.songs;
            }

            const modifiedData = await Promise.all(
                result.data.map(async (song) => {
                    const durationSeconds = await getAudioDuration(song.audio);
                    const formattedDuration = formatDuration(durationSeconds);

                    return {
                        ...song,
                        artist: song.singers.map(item => item.singerName).join(", "),
                        album: song.albums.map(item => item.title).join(", "),
                        duration: formattedDuration,
                        ...(user && {
                            isFavorite: favoriteSongIds.includes(song._id)
                        }),
                    };
                })
            );
            setData(modifiedData);
        };

        fetchAPI();
    }, [refresh]);


    const sortedData = [...data].sort((a, b) => b.play_count - a.play_count);

    const config = {
        data: sortedData.map((item, index) => ({
            ...item,
            displayTitle: `${index + 1}. ${item.title}`
        })),
        xField: 'displayTitle',
        yField: 'play_count',
        color: ({ play_count }) =>
            play_count > 1000 ? '#E04FFF' : play_count > 800 ? '#58C7F3' : '#44FFAA',
        label: {
            position: 'top',
            style: {
                fill: '#FFF',
                fontSize: 12,
                shadowBlur: 4,
                shadowColor: '#000',
            },
        },
        xAxis: { label: { style: { fill: '#ddd' } } },
        yAxis: { label: { style: { fill: '#aaa' } } },
        tooltip: {
            showMarkers: false,
            customContent: (title, items) => {
                const item = items?.[0]?.data;
                return `
          <div style="padding: 10px; color: white">
            <strong>${item.displayTitle}</strong><br/>
            ${item.play_count} lượt nghe
          </div>
        `;
            },
        },
        height: 500,
        autoFit: true,
    };

    const handlePlay = (e, song) => {
        e.preventDefault();
        if (currentSong && currentSong.id === song.id) {
            togglePlay();
        } else {
            playSong(song);
            addToQueue(song);
        }
    }

    const handleFavourite = async (id) => {
        if (!user) {
            toast.warning("Vui lòng đăng nhập để thêm bài hát yêu thích!", {
                position: "top-center",
                autoClose: 3000,
                transition: Bounce,
            });
            return;
        }

        const songID = id;
        const userID = user.id;

        try {
            const result = await create_favoriteSong({
                userId: userID,
                songId: songID,
            });
            if(result){
                setRefresh(!refresh);
            }
            console.log("Yêu thích thành công:", result);
        } catch (error) {
            console.error("Lỗi khi thêm vào yêu thích:", error);
        }
    };

    return (
        <div style={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 24, background: '#170F23', borderRadius: 8, marginBottom: '4rem' }}>
            <div style={{ padding: 24, background: '#170F23', borderRadius: 8, paddingBottom: '0rem' }}>
                <h2 style={{ color: '#fff', marginBottom: '0rem' }}> <CustomerServiceOutlined /> Bảng xếp hạng Top 10 bài hát</h2>
                <Column {...config} />
            </div>

            <div style={{ marginTop: '0rem', color: '#fff' }}>
                {sortedData.map((song, index) => (
                    <div
                        key={song._id}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{
                            backgroundColor: hoveredIndex === index ? "#2c213d" : "transparent",
                            display: 'grid',
                            gridTemplateColumns: '50px 60px 1fr 1fr 80px',
                            gap: '1rem',
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid #333',
                            alignItems: 'center',
                            position: 'relative',
                        }}
                    >
                        {/* STT */}
                        <span style={{
                            color: index === 0 ? '#5AD8A6' : index === 1 ? '#5B8FF9' : index === 2 ? '#F6BD16' : '#ccc',
                            fontWeight: 'bold',
                            fontSize: '2.5rem'
                        }}>{index + 1}</span>

                        {/* Avatar with hover play icon */}
                        <div style={{ position: 'relative', width: 50, height: 50 }}>
                            <img
                                src={song.avatar}
                                alt={song.title}
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 4,
                                    objectFit: 'cover',
                                    opacity: hoveredIndex === index ? 0.5 : 1,
                                    transition: 'opacity 0.3s ease',
                                }}
                            />
                            {hoveredIndex === index && (
                                <PlayCircleOutlined
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: 28,
                                        color: '#fff',
                                        cursor: 'pointer',
                                    }}
                                    onClick={(e) => {
                                        const formattedData = {
                                            ...song,
                                            cover: song.avatar,
                                            artist: song.singers
                                                .map((song) => song.singerName)
                                                .join(", "),
                                        }
                                        handlePlay(e, formattedData)
                                    }}
                                />
                            )}
                        </div>

                        {/* Title and artist */}
                        <div>
                            <div style={{ fontWeight: 500 }}>{song.title}</div>
                            <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{song.artist}</div>
                        </div>

                        {/* Album */}
                        <span>{song.album}</span>

                        {/* Duration or icons */}
                        {hoveredIndex === index ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <HeartFilled style={{
                                    color: song.isFavorite ? 'red' : 'gray',
                                    cursor: 'pointer',
                                }} onClick={() => handleFavourite(song._id)} />
                                <MoreOutlined style={{ color: '#fff', cursor: 'pointer', }} />
                            </div>
                        ) : (
                            <span>{song.duration}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BXH;

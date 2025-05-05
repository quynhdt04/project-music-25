import React, { useEffect, useState } from 'react';
import { Card, List, Avatar, Typography, Tooltip, Row, Col } from 'antd';
import { data, Link, useParams } from 'react-router-dom';
import { FaPlay } from "react-icons/fa";
import { HeartFilled } from "@ant-design/icons";
import { search_albums, search_singers, search_songs } from '../../../services/SearchHomeServices';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { get_song_by_id } from '../../../services/SongServices';
import DropupMenuPlayList from '../../../components/DropupMenuPlayList';
import { create_favoriteSong, get_favoriteSong } from '../../../services/FavoriteSongServices';
import { toast, Bounce } from "react-toastify";

const { Text, Title } = Typography;

function SearchHome() {
    const { keyword } = useParams();
    const [hovered, setHovered] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [hoveredAlbum, setHoveredAlbum] = useState(null);
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [singers, setSingers] = useState([]);
    const { currentSong, isPlaying, playSong, togglePlay, addToQueue, getAudioDuration, formatDuration } =
        useMusicPlayer();
    const user = JSON.parse(sessionStorage.getItem("user"));

    console.log("album", albums)
    useEffect(() => {
        const fetchApi = async () => {
            if (!keyword) return;
            const result = await search_songs(keyword);
            let favoriteSongIds = [];
            if (user) {
                const favoriteSongs = await get_favoriteSong(user.id);
                favoriteSongIds = favoriteSongs.songs;
            }
            const formattedSongs = await Promise.all(
                result.data.map(async (song) => {
                    const durationSeconds = await getAudioDuration(song.audio);
                    const formattedDuration = formatDuration(durationSeconds);
                    return {
                        ...song,
                        cover: song.avatar,
                        artist: song.singers.map((item) => item.singerName).join(", "),
                        duration: formattedDuration,
                        ...(user && {
                            isFavorite: favoriteSongIds.includes(song.id)
                        }),
                    };
                })
            );

            setSongs(formattedSongs);
        };

        fetchApi();
    }, [keyword]);

    useEffect(() => {
        const fetchApi = async () => {
            const resultAlbums = await search_albums(keyword);
            const formattedAlbums = await Promise.all(
                resultAlbums.data.map((album) => {
                    return {
                        ...album,
                        cover: album.cover_image || "../../../../public/image/album_default.png",
                        artist: album.singer ? album.singer.fullName : "Không rõ",
                    };
                })
            )
            setAlbums(formattedAlbums);
        }
        fetchApi();
    }, [keyword])

    useEffect(() => {
        const fetchApi = async () => {
            const resultSingers = await search_singers(keyword);
            setSingers(resultSingers.data);
        }
        fetchApi();
    }, [keyword])

    const handlePlay = (e, song) => {
        e.preventDefault();

        console.log("click", song)
        if (currentSong && currentSong.id === song.id) {
            togglePlay();
        } else {
            playSong(song);
            addToQueue(song);
        }
    }

    const handlePlayAlbum = async (album) => {
        try {
            const songsData = await Promise.all(
                album.songs.map(async (songId) => {
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
                cover: song.avatar || "../default-album.jpg",
                artist: song.singers.map((item) => item.singerName).join(", "),
            }));

            if (songsDataWithCover.length > 0) {
                playSong(songsDataWithCover[0]);
                addToQueue([...songsDataWithCover]);
            } else {
                console.log("Playlist rỗng");
            }
        } catch (error) {
            console.error("Lỗi khi play:", error);
        }
    };

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
            if (result) {
                // setRefresh(!refresh);
            }
            console.log("Yêu thích thành công:", result);
        } catch (error) {
            console.error("Lỗi khi thêm vào yêu thích:", error);
        }
    };

    return (
        <>
            <div className="app-container-wrapper" style={{ marginBottom: "7%" }}>
                {songs.length > 0 && (
                    <div style={{ display: 'flex', gap: 24, padding: 24, height: 350, color: "#ffffff" }}>
                        <Card
                            title={<span style={{ color: '#ffffff', fontSize: "24px" }}>Top result</span>}
                            headStyle={{ borderBottom: "none" }}
                            style={{
                                width: 300,
                                background: "#231B2E",
                                border: "none",
                                color: "#ffffff",
                                position: "relative",
                                overflow: "hidden"
                            }}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                        >
                            <img
                                alt="Album Cover"
                                src={songs[0].cover}
                                style={{ width: '40%', height: "100px", marginBottom: 12, objectFit: "cover" }}
                            />
                            <Title level={4} style={{ marginBottom: 0, color: "#ffffff" }}>
                                {songs[0].title}
                            </Title>
                            <Text style={{ color: "#cccccc" }}>Song • {songs[0].artist}</Text>

                            {hovered && (
                                <div
                                    style={{
                                        position: "absolute",
                                        right: 16,
                                        bottom: 16,
                                        backgroundColor: "#1DB954",
                                        borderRadius: "50%",
                                        width: 40,
                                        height: 40,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                                        cursor: "pointer"
                                    }}
                                    onClick={(e) => {
                                        const formattedData = {
                                            ...songs[0],
                                            cover: songs[0].avatar,
                                            artist: songs[0].singers
                                                .map((item) => item.singerName)
                                                .join(", "),
                                        }
                                        handlePlay(e, formattedData)
                                    }}
                                >
                                    <FaPlay color="black" />
                                </div>
                            )}
                        </Card>

                        <Card
                            title={<span style={{ color: '#ffffff', fontSize: "24px" }}>Songs</span>}
                            headStyle={{ borderBottom: "none" }}
                            style={{ flex: 1, background: "#170F23", border: "none", color: "#ffffff" }}
                        >
                            <List
                                dataSource={songs}
                                renderItem={(item, index) => (
                                    <List.Item
                                        style={{
                                            borderBottom: "none",
                                            background: hoveredIndex === index ? "#2a213a" : "transparent",
                                            borderRadius: 6,
                                            padding: "8px 12px",
                                            transition: "background 0.3s",
                                            position: "relative"
                                        }}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                                            <div style={{ position: "relative", marginRight: 12 }}>
                                                <Avatar
                                                    src={item.cover}
                                                    style={{
                                                        borderRadius: 8,
                                                        width: "40px",
                                                        height: "40px",
                                                        objectFit: "cover"
                                                    }}
                                                    shape="square"
                                                />
                                                {hoveredIndex === index && (
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            top: 0,
                                                            left: 0,
                                                            width: "40px",
                                                            height: "40px",
                                                            backgroundColor: "rgba(0,0,0,0.5)",
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            borderRadius: 8
                                                        }}
                                                    >
                                                        <FaPlay
                                                            color="white"
                                                            size={12}
                                                            onClick={(e) => {
                                                                const formattedData = {
                                                                    ...item,
                                                                    cover: item.avatar,
                                                                    artist: item.singers
                                                                        .map((item) => item.singerName)
                                                                        .join(", "),
                                                                }
                                                                handlePlay(e, formattedData)
                                                            }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <Text strong style={{ color: "#ffffff" }}>{item.title}</Text>
                                                <br />
                                                <Text style={{ color: "#cccccc" }}>{item.artist}</Text>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            {hoveredIndex === index && (
                                                <>
                                                    <Tooltip title="Add">
                                                        <HeartFilled style={{
                                                            color: item.isFavorite ? 'red' : 'gray',
                                                            cursor: 'pointer',
                                                        }} onClick={() => handleFavourite(item._id)} />
                                                    </Tooltip>
                                                    <Tooltip title="More">
                                                        <DropupMenuPlayList songID={item._id} user={user} />
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Text style={{ color: "#ffffff", minWidth: 40 }}>{item.duration}</Text>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </div>
                )}
                {/* Albums */}
                {albums.length > 0 && (
                    <div style={{ marginBottom: "30px", padding: 24 }}>
                        <Typography.Title level={5} style={{ marginBottom: 16, color: "#ffffff", fontSize: "24px" }}>
                            Albums
                        </Typography.Title>
                        <Row gutter={[16, 16]}>
                            {albums.map((album, index) => (
                                <Col key={index} xs={12} sm={8} md={6} lg={4} xl={4}>
                                    <Link to={`/album/${album.id}/${album.slug}`} state={{ album }} >
                                        <div
                                            onMouseEnter={() => setHoveredAlbum(index)}
                                            onMouseLeave={() => setHoveredAlbum(null)}
                                            style={{ position: 'relative' }}
                                        >
                                            <Card
                                                style={{ width: '100%' }}
                                                cover={
                                                    <div style={{ position: 'relative' }}>
                                                        <img
                                                            alt={album.title}
                                                            src={album.cover}
                                                            style={{ width: '100%', height: "140px", objectFit: "cover" }}
                                                        />
                                                        {hoveredAlbum === index && (
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                                    borderRadius: '50%',
                                                                    width: 40,
                                                                    height: 40,
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <FaPlay
                                                                    color="#fff"
                                                                    size={20}
                                                                    onClick={() => handlePlayAlbum(album)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                            >
                                                <Card.Meta
                                                    title={<Text strong ellipsis>{album.title}</Text>}
                                                    description={<Text type="secondary" ellipsis>{album.artist}</Text>}
                                                />
                                            </Card>
                                        </div>
                                    </Link>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}
                {/* Artists */}
                {singers.length > 0 && (
                    <div style={{ padding: 24 }} className='singers'>
                        <Typography.Title level={5} style={{ marginBottom: 16, color: '#ffffff', fontSize: "24px" }}>
                            Artists
                        </Typography.Title>
                        <Row gutter={[24, 24]} justify='flex-start' >
                            {singers.map((artist, index) => (
                                <Col key={index}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <Avatar
                                            src={artist.avatar}
                                            shape="circle"
                                            style={{
                                                width: 160,
                                                height: 160,
                                                objectFit: 'cover',
                                                marginBottom: 12
                                            }}
                                        />
                                        <Text strong style={{ color: '#ffffff' }}>
                                            {artist.fullName}
                                        </Text>
                                        <Text type="secondary" style={{ color: '#b3b3b3' }}>
                                            Artist
                                        </Text>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}
            </div>
        </>
    );
}

export default SearchHome;
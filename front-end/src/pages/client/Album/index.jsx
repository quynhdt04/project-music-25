import React, { use, useEffect, useState } from 'react';
import { Layout, Row, Col, Typography, List, Avatar, Space } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { FaPlay } from "react-icons/fa";
import { useLocation, useParams } from 'react-router-dom';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { get_favoriteSong } from '../../../services/FavoriteSongServices';
import { get_song_by_id } from '../../../services/SongServices';

const { Content } = Layout;
const { Title, Text } = Typography;

function Album() {
    const [hoveredAlbum, setHoveredAlbum] = useState(null);
    const { id, slug } = useParams();
    const location = useLocation();   
    const albumInfo = location.state?.album;
    const { currentSong, isPlaying, playSong, togglePlay, addToQueue, getAudioDuration, formatDuration } =
    useMusicPlayer();
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [totalDuration, setTotalDuration] = useState("");
    const [songList, setSongList] = useState([]);

    useEffect(() => {
        const fetchApi = async () => {
          try {
            const favoriteSongs = await get_favoriteSong(user.id);
            let totalDurationSeconds = 0;
    
            const songDetails = await Promise.all(
                albumInfo.songs.map(async (songId) => {
                const song = await get_song_by_id(songId);
                const durationSeconds = await getAudioDuration(song.data.audio);
                totalDurationSeconds += durationSeconds;
    
                const formattedDuration = formatDuration(durationSeconds);
    
                return {
                    ...song.data,
                    cover: song.data.avatar,
                    artists: song.data.singers.map((item) => item.singerName).join(", "),
                    duration: formattedDuration,
                    isFavorite: favoriteSongs.songs.includes(song.data.id),
                };
              })
            );
    
            setSongList(songDetails);
            setTotalDuration(formatDuration(totalDurationSeconds));
            if (songDetails.length > 0) {
            }
          } catch (e) {
            console.error("Lỗi khi tải albums:", e);
          }
        };
    
        fetchApi();
      }, []);

    console.log(albumInfo)


    return (
        <Layout style={{ backgroundColor: '#170F23', minHeight: '100vh', padding: '24px', marginBottom:"7%" }}>
            <Content style={{ padding: '24px', backgroundColor: '#170F23', borderRadius: '8px' }}>
                <Row gutter={[24, 24]} style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Col xs={24} md={8} style={{ display: 'flex' }}>
                        <div style={{ width: '100%', maxWidth: '300px' }}>
                            <img
                                src={albumInfo.cover}
                                alt={albumInfo.title}
                                style={{ width: '100%', borderRadius: '4px' }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={16} style={{ color: '#fff' }}>
                        <Text style={{ color: '#999' }}>Single</Text>
                        <Title level={2} style={{ color: '#fff', margin: '8px 0' }}>
                            {albumInfo.title}
                        </Title>
                        <Text style={{ color: '#fff' }}>
                            {albumInfo.artist} · {new Date(albumInfo.createdAt).getFullYear()} · {albumInfo.songs.length} songs, {totalDuration}
                        </Text>
                        <Space size="large" style={{ marginTop: '24px' }}>
                            <div
                                style={{
                                    backgroundColor: "#1DB954",
                                    borderRadius: "50%",
                                    width: 40,
                                    height: 40,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                                    cursor: "pointer",
                                    marginLeft: "20px"
                                }}
                            >
                                <FaPlay color="black" />
                            </div>
                        </Space>
                    </Col>
                </Row>

                <div style={{ marginTop: '40px' }}>
                    <Row align="middle" style={{ color: '#fff', paddingBottom: '12px', borderBottom: '1px solid #262626' }}>
                        <Col span={1} style={{ marginRight: '16px' }}>#</Col>
                        <Col span={18}>Title</Col>
                        <Col span={5} style={{ textAlign: 'right', flex: 1, paddingRight: "24px" }}>
                            <ClockCircleOutlined style={{ marginRight: '25%' }} />
                        </Col>
                    </Row>
                    <List
                        dataSource={songList}
                        renderItem={(item, index) => {
                            const isHovered = hoveredAlbum === item.id;

                            return (
                                <List.Item
                                    key={item.id}
                                    style={{
                                        padding: '12px 0',
                                        color: '#fff',
                                    }}
                                    onMouseEnter={() => setHoveredAlbum(item.id)}
                                    onMouseLeave={() => setHoveredAlbum(null)}
                                >
                                    <Row gutter={24} style={{ width: '100%' }} align="middle">
                                        {/* Thumbnail with play icon */}
                                        <Col span={1} style={{ marginRight: '16px' }}>
                                            <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                                                <img
                                                    src={item.cover}
                                                    alt={item.title}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                    }}
                                                />
                                                {isHovered && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            borderRadius: '4px',
                                                        }}
                                                    >
                                                        <FaPlay color="#fff" size={12} />
                                                    </div>
                                                )}
                                            </div>
                                        </Col>

                                        {/* Title and artist */}
                                        <Col span={18}>
                                            <Text strong style={{ color: '#ffffff' }}>{item.title}</Text>
                                            <div style={{ color: '#999' }}>{item.artists}</div>
                                        </Col>

                                        {/* Duration with hover icons */}
                                        <Col span={5} style={{ textAlign: 'right', flex: 1, paddingRight: "24px", color: '#aaa' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                alignItems: 'center',
                                                gap: '8px',
                                                minWidth: '100px'
                                            }}>
                                                <span style={{
                                                    fontSize: '18px',
                                                    opacity: isHovered ? 1 : 0,
                                                    transition: 'opacity 0.2s'
                                                }}>＋</span>
                                                <span>{item.duration}</span>
                                                <span style={{
                                                    fontSize: '18px',
                                                    opacity: isHovered ? 1 : 0,
                                                    transition: 'opacity 0.2s'
                                                }}>⋯</span>
                                            </div>
                                        </Col>
                                    </Row>
                                </List.Item>
                            );
                        }}
                    />
                </div>
            </Content>
        </Layout>
    );
}

export default Album;

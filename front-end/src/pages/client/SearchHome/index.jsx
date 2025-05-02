import React, { useState } from 'react';
import { Card, List, Avatar, Typography, Tooltip, Row, Col } from 'antd';
import { useParams } from 'react-router-dom';
import { FaPlay, FaPlus, FaEllipsisH } from "react-icons/fa";

const { Text, Title } = Typography;

function SearchHome() {
    const params = useParams();
    const [hovered, setHovered] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [hoveredAlbum, setHoveredAlbum] = useState(null);
    console.log(params);

    const data = [
        {
            title: 'Hymn for the Weekend',
            artist: 'Coldplay',
            duration: '4:18',
            cover: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            title: 'Hype Boy',
            artist: 'NewJeans',
            duration: '2:59',
            cover: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            title: 'hypnotic - super slowed',
            artist: 'isq',
            duration: '2:00',
            cover: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            title: 'Hypnotized - Live',
            artist: 'Anyma, Ellie Goulding',
            duration: '3:13',
            cover: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
    ];

    const albumData = [
        {
            title: 'Indigo',
            artist: '2022 • RM',
            cover: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            title: 'Overworking',
            artist: 'Releases on May 9, 2025 • MARTIN K4RMA',
            cover: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            title: 'Right Place, Wrong Person',
            artist: '2024 • RM',
            cover: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            title: 'Baby RMX',
            artist: '2025 • KayArchonn',
            cover: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            title: 'mono.',
            artist: '2018 • RM',
            cover: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            title: 'Stop The Rain (TABLO X RM)',
            artist: '2025 • TABLO, RM',
            cover: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
    ];

    const artistsData = [
        {
            name: 'RM',
            avatar: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            name: 'j-hope',
            avatar: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            name: 'Rmc Mike',
            avatar: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            name: 'V',
            avatar: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            name: 'RMB Justize',
            avatar: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
        {
            name: 'Jin',
            avatar: 'https://res.cloudinary.com/dtycrb54t/image/upload/v1742532700/damzo2vd5jnzpj9fg1j3.jpg',
        },
    ];

    return (
        <>
            <div className="app-container-wrapper" style={{ marginBottom: "7%" }}>
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
                            src={data[0].cover}
                            style={{ width: '40%', height: "100px", marginBottom: 12, objectFit: "cover" }}
                        />
                        <Title level={4} style={{ marginBottom: 0, color: "#ffffff" }}>
                            {data[0].title}
                        </Title>
                        <Text style={{ color: "#cccccc" }}>Song • {data[0].artist}</Text>

                        {hovered && (
                            <div
                                style={{
                                    position: "absolute",
                                    right: 16,
                                    bottom: 16,
                                    backgroundColor: "#1DB954", // Spotify green
                                    borderRadius: "50%",
                                    width: 40,
                                    height: 40,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                                    cursor: "pointer"
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
                            dataSource={data}
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
                                                    <FaPlay color="white" size={12} />
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
                                                    <FaPlus color="white" style={{ cursor: "pointer" }} />
                                                </Tooltip>
                                                <Tooltip title="More">
                                                    <FaEllipsisH color="white" style={{ cursor: "pointer" }} />
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
                {/* Albums */}
                <div style={{ marginBottom: "30px", padding: 24 }}>
                    <Typography.Title level={5} style={{ marginBottom: 16, color: "#ffffff", fontSize: "24px" }}>
                        Albums
                    </Typography.Title>
                    <Row gutter={[16, 16]}>
                        {albumData.map((album, index) => (
                            <Col key={index} xs={12} sm={8} md={6} lg={4} xl={4}>
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
                                                        <FaPlay color="#fff" size={20} />
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
                            </Col>
                        ))}
                    </Row>
                </div>
                {/* Artists */}
                <div style={{padding: 24}}>
                    <Typography.Title level={5} style={{ marginBottom: 16, color: '#ffffff' }}>
                        Artists
                    </Typography.Title>
                    <Row gutter={[24, 24]} justify="space-between" >
                        {artistsData.map((artist, index) => (
                            <Col key={index} xs={12} sm={8} md={6} lg={4} xl={3}>
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
                                        {artist.name}
                                    </Text>
                                    <Text type="secondary" style={{ color: '#b3b3b3' }}>
                                        Artist
                                    </Text>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>
        </>
    );
}

export default SearchHome;
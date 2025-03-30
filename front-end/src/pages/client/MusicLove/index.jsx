import React, { useState } from "react";
import { Row, Col, Avatar } from "antd";
import { HeartFilled, PlayCircleOutlined } from "@ant-design/icons";

const data = [
    {
        key: "1",
        song: "Chạy về khóc với anh",
        artist: "Erik",
        album: "Single",
        duration: "3:45",
        image: "https://via.placeholder.com/50",
    },
    {
        key: "2",
        song: "Có em",
        artist: "Madihu ft. Low G",
        album: "Single",
        duration: "4:12",
        image: "https://via.placeholder.com/50",
    },
];

const FavoriteSongs = () => {
    const [hoveredRow, setHoveredRow] = useState(null);
    const [favorite, setFavorite] = useState({});

    const toggleFavorite = (key) => {
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
                    key={item.key} 
                    align="middle" 
                    style={{ 
                        padding: "10px 0", 
                        borderBottom: "1px solid #333", 
                        position: "relative", 
                        backgroundColor: hoveredRow === item.key ? "#2F2739" : "transparent",
                        transition: "background-color 0.3s"
                    }}
                    onMouseEnter={() => setHoveredRow(item.key)}
                    onMouseLeave={() => setHoveredRow(null)}
                >
                    <Col span={12} style={{ display: "flex", alignItems: "center", position: "relative" }}>
                        <Avatar src={item.image} shape="square" size={50} style={{ marginRight: 10, position: "relative" }} />
                        {hoveredRow === item.key && (
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
                            <div style={{ fontWeight: "bold", color: "#fff" }}>{item.song}</div>
                            <div style={{ color: "gray", fontSize: "12px" }}>{item.artist}</div>
                        </div>
                    </Col>
                    <Col span={8} style={{ color: "#fff" }}>{item.album}</Col>
                    <Col span={4} style={{ textAlign: "center", color: "#fff" }}>
                        <HeartFilled 
                            style={{ 
                                marginRight: 8, 
                                color: favorite[item.key] ? "gray" : "#ff4d4f", 
                                cursor: "pointer" 
                            }} 
                            onClick={() => toggleFavorite(item.key)}
                        />
                        {item.duration}
                    </Col>
                </Row>
            ))}
        </div>
    );
};

export default FavoriteSongs;

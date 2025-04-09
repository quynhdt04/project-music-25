import React, { useState } from "react";
import { Button } from "react-bootstrap";
import {
  SuitHeart,
  ThreeDots,
  Plus,
  HeartFill,
  Heart,
} from "react-bootstrap-icons";
import { FaPlay, FaPause } from "react-icons/fa";
import useMusicPlayer from "../../hooks/useMusicPlayer";
import "./Media.scss";
import { Link } from "react-router-dom";

const Media = ({ item, selectedItem, handlePlayClick, type }) => {
  const [isLiked, setIsLiked] = useState(false);
  const { addToQueue } = useMusicPlayer();

  const handleAddToQueue = (e) => {
    e.stopPropagation();
    addToQueue(item);
  };

  return (
    <div
      className={`song-item-wrapper ${
        selectedItem === item.id ? "active" : ""
      } d-flex align-items-center mt-2`}
      key={item.id}
    >
      <div className="song-item d-flex align-items-center" style={{ flex: 1 }}>
        {type !== "queue" && (
          <div className="queue-button-wrapper" style={{ flex: "5%" }}>
            <Button
              variant="link"
              className="queue-button"
              onClick={handleAddToQueue}
            >
              <Plus />
            </Button>
          </div>
        )}
        <div
          className="song-item-left d-flex align-items-center"
          style={{ flex: "40%" }}
        >
          <div className="song-thumb" style={{ cursor: "pointer" }}>
            <img
              src={item.cover}
              alt="song"
              onClick={(e) => handlePlayClick(e, item)}
            />
          </div>
          <div className="song-info ms-3">
            <div
              className="song-name"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                lineHeight: "1.5",
              }}
            >
              {item.title}
            </div>
            <div className="song-singer">
              <span
                style={{
                  fontSize: "12.8px",
                  textDecoration: "none",
                  color: "#FFFFFF80",
                  cursor: "pointer",
                }}
              >
                {item.artist}
              </span>
            </div>
          </div>
        </div>
        {type !== "queue" && (
          <div
            className="song-item-center d-flex align-items-center"
            style={{ flex: "45%" }}
          >
            <div className="album-name">
              <span style={{ fontSize: "13px", color: "#FFFFFF80" }}>
                {item.album}
              </span>
            </div>
          </div>
        )}
        <div
          className="song-item-right d-flex align-items-center justify-content-center"
          style={{ flex: type !== "queue" ? "10%" : "none" }}
        >
          <div className="song-actions">
            <Button
              variant="link"
              className={`like-button ${isLiked ? "liked" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            >
              {isLiked ? <HeartFill /> : <Heart />}
            </Button>
            <div className="duration">
              <span style={{ fontSize: "13px", color: "#FFFFFF80" }}>
                {item.duration}
              </span>
            </div>
            {type !== "queue" && (
              <Button
                variant="link"
                className="more-button"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <ThreeDots />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Media;

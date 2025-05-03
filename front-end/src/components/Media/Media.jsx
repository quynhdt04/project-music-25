import React, { useEffect, useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import {
  FileMusic,
  ThreeDots,
  ThreeDotsVertical,
  Plus,
  HeartFill,
  Heart,
  ArrowUpShort,
  ArrowDownShort,
  XCircle,
  PlusCircle,
} from "react-bootstrap-icons";
import { FaPlay, FaPause } from "react-icons/fa";
import useMusicPlayer from "../../hooks/useMusicPlayer";
import "./Media.scss";
import { checkIsSongLikedByCurrentUser } from "../../services/SongServices.js";
import PlaylistDropdown from "../PlaylistDropdown/PlaylistDropdown.jsx";
import { checkUserAuthenticated } from "../../utils/constants";

const Media = ({ item, selectedItem, handlePlayClick, type }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const {
    isLiked,
    setIsLiked,
    addToQueue,
    moveSong,
    removeSongFromQueue,
    handleLikeClick,
  } = useMusicPlayer();
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      if (user && item) {
        const response = await checkIsSongLikedByCurrentUser(item.id, user.id);
        if (response.status === 200) {
          setIsLiked(response.isLiked);
        }
      }
    };

    fetchData();
  }, [item.id]);

  const handleAddToQueue = (e) => {
    e.stopPropagation();
    checkUserAuthenticated() && addToQueue(item);
  };

  const handleRemoveFromQueue = (e, item) => {
    e.stopPropagation();
    checkUserAuthenticated() && removeSongFromQueue(item);
  };

  const handleMoveUp = (e, song) => {
    e.stopPropagation();
    checkUserAuthenticated() && moveSong(song, "up");
  };

  const handleMoveDown = (e, song) => {
    e.stopPropagation();
    checkUserAuthenticated() && moveSong(song, "down");
  };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <Button
      variant="link"
      className="more-button"
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
        setDropdownOpen(!dropdownOpen);
      }}
    >
      <ThreeDots />
    </Button>
  ));

  return (
    <div
      className={`song-item-wrapper ${selectedItem === item.id ? "active" : ""
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
              src={item.cover || "https://via.placeholder.com/150"}
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
              title={item.title}
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
            style={{ flex: "50%" }}
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
            {type === "queue" && (
              <Button
                variant="link"
                className={`like-button ${isLiked ? "liked" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  checkUserAuthenticated() && handleLikeClick(item.slug);
                }}
              >
                {isLiked ? <HeartFill /> : <Heart />}
              </Button>
            )}
            <div className="duration">
              <span style={{ fontSize: "13px", color: "#FFFFFF80" }}>
                {item.duration}
              </span>
            </div>
            {type !== "queue" && (
              <div className="queue-button-wrapper" style={{ flex: "5%" }}>
                <Button
                  variant="link"
                  className="queue-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <ThreeDotsVertical />
                </Button>
              </div>
            )}
            <Dropdown
              show={dropdownOpen}
              onToggle={(isOpen) => setDropdownOpen(isOpen)}
            >
              {type === "queue" && <Dropdown.Toggle as={CustomToggle} />}
              <Dropdown.Menu
                className={`custom-dropdown-menu ${dropdownOpen ? "" : "hide"}`}
              >
                <Dropdown.Item
                  style={{ position: "relative" }}
                  onMouseEnter={() => {
                    setShowPlaylistDropdown(true);
                  }}
                  onMouseLeave={() => {
                    setShowPlaylistDropdown(false);
                  }}
                >
                  <FileMusic />
                  Thêm bài hát vào playlist
                  {showPlaylistDropdown && (
                    <div className="playlist-dropdown-container">
                      <PlaylistDropdown
                        songID={item.id}
                        user={user}
                      />
                    </div>
                  )}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={(e) => {
                    e.stopPropagation();
                    checkUserAuthenticated() && handleLikeClick(item.slug);
                    setDropdownOpen(false);
                  }}
                >
                  {isLiked ? <HeartFill /> : <Heart />}
                  Thêm bài hát yêu thích
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToQueue(item);
                    setDropdownOpen(false);
                  }}
                >
                  <PlusCircle />
                  Thêm bài hát vào hàng đợi
                </Dropdown.Item>
                {type === "queue" && (
                  <>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromQueue(e, item);
                        setDropdownOpen(false);
                      }}
                    >
                      <XCircle className="me-2" />
                      Xóa khỏi hàng đợi
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveUp(e, item);
                        setDropdownOpen(false);
                      }}
                    >
                      <ArrowUpShort className="me-2" />
                      Đẩy bài hát lên
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveDown(e, item);
                        setDropdownOpen(false);
                      }}
                    >
                      <ArrowDownShort className="me-2" />
                      Đẩy bài hát xuống
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Media;

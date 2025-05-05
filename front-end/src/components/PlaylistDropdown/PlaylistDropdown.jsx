import React, { useState, useEffect, useRef } from "react";
import "../DropupMenuPlayList/DropupMenuPlayList.css";
import { Modal, Form, Input, Button } from "antd";
import { FaPlus, FaHeadphones } from "react-icons/fa";
import { add_song_to_playlist, create_playList, get_all_playList } from "../../services/PlayListServices";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PlaylistDropdown = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState('');
    const [playlist, setPlayList] = useState([]);
    const { songID, user } = props;
    const modalRef = useRef(null);

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setIsModalOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const fetchAPI = async () => {
            const result = await get_all_playList();
            setPlayList(result.playList);
        };
        fetchAPI();
    }, []);

    const filteredPlayList = playlist.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddPlayList = async (values) => {
        const title = values.title;

        if (!user) {
            toast.error("Bạn cần đăng nhập để tạo playlist!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        const data = {
            userId: user.id,
            title: title,
            imageAlbum: "",
            songs: [],
        };

        try {
            const result = await create_playList(data);

            if (result && result.playlistId) {
                const newPlaylistId = result.playlistId;

                const resultsong = await add_song_to_playlist(newPlaylistId, {
                    songId: songID,
                });

                if (resultsong.message) {
                    toast.success("Đã thêm bài hát vào playlist mới!", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                } else {
                    toast.error("Thêm bài hát thất bại!", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                }

                setIsModalOpen(false);
            } else {
                toast.error("Tạo playlist thất bại!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi khi tạo playlist!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleAddSongInPlayList = async (id) => {
        try {
            const result = await add_song_to_playlist(id, {
                songId: songID,
            });
            toast.warning("Thêm bài hát vào playlist thành công!", {
                position: "bottom-left",
                autoClose: 3000,
                transition: Bounce,
            });
            console.log("Kết quả cập nhật:", result);
        } catch (error) {
            console.error("Lỗi khi thêm bài hát vào playlist:", error);
        }
    }

    console.log("isModalOpen", isModalOpen);

    return (
        <>
            <Modal
                title="Tạo playlist mới"
                footer={null}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                className="play-list__modal"
                ref={modalRef}
            >
                <Form layout="vertical" form={form} onFinish={handleAddPlayList} onClick={(e) => e.stopPropagation()}>
                    <Form.Item
                        name="title"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên playlist!" },
                            { max: 50, message: "Tên playlist tối đa 50 ký tự!" },
                        ]}
                    >
                        <Input placeholder="Nhập tên playlist..." />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Tạo mới
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <div className="submenu">
                <div className="submenu__search">
                    <input
                        placeholder="Tìm playlist..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="submenu__item" onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    showModal();
                }}>
                    <FaPlus /> Tạo playlist mới
                </div>
                {filteredPlayList.map((item) => (
                    <div key={item.id} className="submenu__item" onClick={() => handleAddSongInPlayList(item.id)}>
                        <FaHeadphones /> {item.title}
                    </div>
                ))}
            </div>
        </>
    )
}

export default PlaylistDropdown;
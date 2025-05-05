import { useState, useRef, useEffect } from "react";
import { FaEllipsisH, FaPlus, FaHeadphones } from "react-icons/fa";
import "./DropupMenuPlayList.css";
import { Modal, Form, Input, Button } from "antd";
import { add_song_to_playlist, create_playList, get_all_playList } from "../../services/PlayListServices";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DropupMenuPlayList = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    const [form] = Form.useForm();
    const menuRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [playlist, setPlayList] = useState([]);
    const { songID, user } = props;

    const toggleMenu = () => {
        if (!user) {
            toast.warning("Vui lòng đăng nhập để sử dụng chức năng này!", {
                position: "top-right",
                autoClose: 3000,
                transition: Bounce,
            });
            return;
        }
        setIsOpen(!isOpen);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false);
            setIsSubMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    return (
        <>
            {/* Modal tạo playlist */}
            <Modal
                title="Tạo playlist mới"
                footer={null}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                className="play-list__modal"
            >
                <Form layout="vertical" form={form} onFinish={handleAddPlayList}>
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

            {/* Menu chính */}
            <div className="dropup" ref={menuRef}>
                <button className="dropup__toggle" onClick={toggleMenu}>
                    <FaEllipsisH />
                </button>

                {user && isOpen && (
                    <div className="dropup__menu">
                        {/* Hover mở submenu */}
                        <div
                            className="dropup__item-wrapper"
                            onMouseEnter={() => setIsSubMenuOpen(true)}
                            onMouseLeave={() => setIsSubMenuOpen(false)}
                        >
                            <div className="dropup__item">
                                <FaPlus /> Thêm vào playlist
                            </div>
                            {isSubMenuOpen && (
                                <div className="submenu">
                                    <div className="submenu__search">
                                        <input
                                            placeholder="Tìm playlist..."
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="submenu__item" onClick={showModal}>
                                        <FaPlus /> Tạo playlist mới
                                    </div>
                                    {filteredPlayList.map((item) => (
                                        <div key={item.id} className="submenu__item" onClick={() => handleAddSongInPlayList(item.id)}>
                                            <FaHeadphones /> {item.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default DropupMenuPlayList;
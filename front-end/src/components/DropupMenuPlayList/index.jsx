import { useState, useRef, useEffect } from "react";
import { FaEllipsisH, FaPlus, FaHeadphones } from "react-icons/fa";
import "./DropupMenuPlayList.css";
import { Modal, Form, Input, Button } from "antd";
import { get_all_playList } from "../../services/PlayListServices";

const DropupMenuPlayList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    const [form] = Form.useForm();
    const menuRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [playlist, setPlayList] = useState([]);

    const toggleMenu = () => {
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
        }
        fetchAPI();
    }, [])

    const filteredPlayList = playlist.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(playlist);

    const handleAddPlayList = (values) => {
        console.log("Thêm playlist:", values.title);
        setIsModalOpen(false);
    };


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

                {isOpen && (
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
                                            onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="submenu__item" onClick={showModal}>
                                        <FaPlus /> Tạo playlist mới
                                    </div>
                                    {filteredPlayList.map((item, index) => (
                                        <div key={index} className="submenu__item">
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

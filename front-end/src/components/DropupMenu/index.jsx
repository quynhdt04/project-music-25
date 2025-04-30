import { useState, useRef, useEffect } from "react";
import { FaEllipsisH, FaEdit, FaTrash } from "react-icons/fa";
import "./DropupMenu.css";
import { path_playList } from "../../services/PlayListServices";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useNavigate } from "react-router-dom";
import { Modal, Form, Input, Button } from "antd";
import { toast, Bounce } from "react-toastify";

const DropupMenu = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef(null);
    const MySwal = withReactContent(Swal);
    const [form] = Form.useForm();
    const { album, setRefreshUpdate  } = props;
    const navigate = useNavigate();

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
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEdit = () => {
        setIsOpen(false);
        form.setFieldsValue({
            title: album.title
        });
        showModal(true);
    };

    const handleDelete = () => {
        setIsOpen(false);
        MySwal.fire({
            title: "Xác nhận xóa",
            text: "Bạn có chắc chắn muốn xóa album này không?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const result = await path_playList(album.id, { deleted: true });
                if (result.message) {
                    navigate(-1);
                    Swal.fire("Thành công!", "Album đã được xóa.", "success");
                } else {
                    Swal.fire("Thất bại!", "Không thể xóa Album.", "error");
                }
            }
        });
    };

    const handleUpdatePlaylist = async (values) => {
        try {
            const result = await path_playList(album.id, { title: values.title });
    
            if (result.message) {
                toast.success("Cập nhật tên album thành công!", { transition: Bounce });
                setIsModalOpen(false);
                setRefreshUpdate(prev => !prev);
            } else {
                toast.error("Không thể cập nhật tên album!", { transition: Bounce });
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật playlist:", error);
            toast.error("Đã xảy ra lỗi khi cập nhật album!", { transition: Bounce });
        }
    };

    return (
        <>
            <Modal
                title="Chỉnh sửa Playlist"
                footer={null}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                className="play-list__modal"
            >
                <Form layout="vertical" form={form} onFinish={handleUpdatePlaylist}>
                    <Form.Item
                        name="title"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên album!" },
                            { max: 50, message: "Tên album tối đa 50 ký tự!" },
                        ]}
                    >
                        <Input
                            placeholder="Nhập tên album..."
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Chỉnh sửa Playlist
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <div className="dropup" ref={menuRef}>
                <button className="dropup__toggle" onClick={toggleMenu}>
                    <FaEllipsisH />
                </button>

                {isOpen && (
                    <div className="dropup__menu">
                        <div className="dropup__item" onClick={handleEdit}>
                            <FaEdit /> Chỉnh sửa playlist
                        </div>
                        <div className="dropup__item dropup__danger" onClick={handleDelete}>
                            <FaTrash /> Xóa playlist
                        </div>
                    </div>
                )}
            </div>
        </>

    );
};

export default DropupMenu;

import "./PlayList.scss";
import { Link } from "react-router-dom";
import { Col, Row, Modal, Form, Input, Button } from "antd";
import { IoIosAddCircleOutline } from "react-icons/io";
import { PlayCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { create_playList, get_all_playList } from "../../../services/PlayListServices";
import { useSelector } from "react-redux";

function PlayList() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const user = useSelector((state) => state.authenReducer.user);
    const [data, setData] = useState([]);
    const [updateState, setUpdateState] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handlePlay = () => {
        console.log("hey");
    }

    const handleDel = () => {
        console.log("del");
    }

    useEffect(() => {
        const fetchApi = async () => {
            const result = await get_all_playList();
            setData(result.playList);
        }
        fetchApi();
    }, [updateState])

    const handleCreatePlaylist = async (e) => {
        const title = e.playlistName;
        const data = {
            userId: user.id,
            title: title,
            imageAlbum: "",
            songs: []
        };

        const result = await create_playList(data);

        if (result.message) {
            form.resetFields();
            setIsModalOpen(false);
            setUpdateState(!updateState);
        }
    };


    return (
        <>
            <Row className="play-list">
                <Col xs={12} sm={12} md={6} lg={6} xl={4} className="play-list__col create" onClick={showModal}>
                    <IoIosAddCircleOutline />
                    <p>Tạo Playlist mới</p>
                </Col>

                <Modal title="Tạo Playlist mới"
                    footer={null}
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    className="play-list__modal">

                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={handleCreatePlaylist}
                    >
                        <Form.Item
                            name="playlistName"
                            rules={[
                                { required: true, message: "Vui lòng nhập tên album!" },
                                { max: 50, message: "Tên album tối đa 50 ký tự!" }
                            ]}
                        >
                            <Input placeholder="Nhập tên album..." />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Tạo Playlist
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {data && data.map(item => (
                    <Col xs={12} sm={12} md={6} lg={6} xl={4} className="play-list__col" key={item.id}>
                        <Link to="/playlist/detail">
                            <div className="img-wrapper">
                                <img src={item.imageAlbum !== "" ? item.imageAlbum : "../../../../public/image/album_default.png"} alt="" />
                            </div>
                            <p>{item.title}</p>
                            <p className="name">{user.fullName}</p>
                        </Link>
                        <div className="play-list__icon">
                            <CloseOutlined className="close" onClick={handleDel} />
                            <PlayCircleOutlined className="play" onClick={handlePlay} />
                        </div>
                    </Col>
                ))}
            </Row>
        </>
    )
}

export default PlayList;
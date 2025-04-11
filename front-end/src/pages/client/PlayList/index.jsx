import "./PlayList.scss";
import { Link } from "react-router-dom";
import { Col, Row, Modal, Form, Input, Button } from "antd";
import { IoIosAddCircleOutline } from "react-icons/io";
import { PlayCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";

function PlayList() {

    const [isModalOpen, setIsModalOpen] = useState(false);

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
        
    }

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

                <Col xs={12} sm={12} md={6} lg={6} xl={4} className="play-list__col">
                    <Link to="/playlist/detail">
                        <img src="https://anhcute.net/wp-content/uploads/2024/09/Anh-avarta-chibi-nu-doi-mu-gau-dau-dang-yeu.jpg" alt="" />
                        <p>Album</p>
                        <p className="name">Name</p>
                    </Link>
                    <div className="play-list__icon">
                        <CloseOutlined className="close" onCanPlay={handleDel}/>
                        <PlayCircleOutlined className="play" onClick={handlePlay} />
                    </div>
                </Col>

                <Col xs={12} sm={12} md={6} lg={6} xl={4} className="play-list__col">
                    <Link to="/playlist/detail">

                        <img src="https://anhcute.net/wp-content/uploads/2024/09/Anh-avarta-chibi-nu-doi-mu-gau-dau-dang-yeu.jpg" alt="" />
                        <p>Album</p>
                        <p className="name">Name</p>
                        <div className="play-list__icon">
                            <CloseOutlined className="close" />
                            <PlayCircleOutlined className="play" />
                        </div>
                    </Link>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={4} className="play-list__col">
                    <Link to="/playlist/detail">

                        <img src="https://anhcute.net/wp-content/uploads/2024/09/Anh-avarta-chibi-nu-doi-mu-gau-dau-dang-yeu.jpg" alt="" />
                        <p>Album</p>
                        <p className="name">Name</p>
                        <div className="play-list__icon">
                            <CloseOutlined className="close" />
                            <PlayCircleOutlined className="play" />
                        </div>
                    </Link>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={4} className="play-list__col">
                    <Link to="/playlist/detail">

                        <img src="https://anhcute.net/wp-content/uploads/2024/09/Anh-avarta-chibi-nu-doi-mu-gau-dau-dang-yeu.jpg" alt="" />
                        <p>Album</p>
                        <p className="name">Name</p>
                        <div className="play-list__icon">
                            <CloseOutlined className="close" />
                            <PlayCircleOutlined className="play" />
                        </div>
                    </Link>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6} xl={4} className="play-list__col">
                    <Link to="/playlist/detail">

                        <img src="https://anhcute.net/wp-content/uploads/2024/09/Anh-avarta-chibi-nu-doi-mu-gau-dau-dang-yeu.jpg" alt="" />
                        <p>Album</p>
                        <p className="name">Name</p>
                        <div className="play-list__icon">
                            <CloseOutlined className="close" />
                            <PlayCircleOutlined className="play" />
                        </div>
                    </Link>
                </Col>
            </Row>
        </>
    )
}

export default PlayList;
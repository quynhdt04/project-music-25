import { useState, useRef, useEffect } from "react";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { MdDelete, MdEdit, MdGroupAdd, MdOutlineClose } from "react-icons/md";
import BoxHead from "../../../components/BoxHead";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Form, InputGroup } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaSearch } from "react-icons/fa";
import "./Conversation.css";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid'; //Tạo id message


// const socket = io("http://localhost:5000");
// const socket = io("http://192.168.36.61:5000");
const socket = io("http://18.214.161.189/");

function Conversation() {
    const [activeMenu, setActiveMenu] = useState(null);
    const [editMode, setEditMode] = useState(null); //thêm sửa xoá
    const [showSearch, setShowSearch] = useState(false);  // State để kiểm soát hiển thị ô tìm kiếm
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [socketConnected, setSocketConnected] = useState(false); //Kết nối socket
    const [realTimeMessages, setRealTimeMessages] = useState([]);

    const menuRef = useRef(null);
    const tempId = uuidv4();
    const account = useSelector((state) => state.authenReducer.account); //user đang đăng nhập
    const messagesEndRef = useRef(null); //cuốn tới tin nhắn mới nhất


    // Dữ liệu 
    const groupItems = [
        { id: "1", name: "Team Dev", img: "https://res.cloudinary.com/dtycrb54t/image/upload/v1742935137/xrgk9muyhwkrzj68hwpo.jpg" },
        { id: "2", name: "Marketing", img: "https://res.cloudinary.com/dtycrb54t/image/upload/v1742935137/xrgk9muyhwkrzj68hwpo.jpg" },
    ];

    const messages = [
        {
            id: "1",
            conversation_id: "1",
            sender_id: "1",
            username: "Người dùng A",
            avatar: "https://res.cloudinary.com/dtycrb54t/image/upload/v1742935213/ni0azxicghf5xmmih5mk.jpg",
            content: "Xin chào! Đây là tin nhắn bên trái.",
            time: "2025-04-09"
        },
        {
            id: "2",
            conversation_id: "1",
            sender_id: "67d814d6b03835935a0d59de",
            username: "mewmew",
            content: "Chào bạn! Đây là tin nhắn bên phải với nội dung dài hơn để kiểm tra việc căn lề và cuộn nội dung nếu cần thiết.",
            time: "2025-04-09",
            avatar: "https://res.cloudinary.com/dtycrb54t/image/upload/v1742214356/b9teeufleo1xvublaly3.jpg",
        },
        {
            id: "3",
            conversation_id: "1",
            sender_id: "3",
            username: "Người dùng B",
            avatar: "https://res.cloudinary.com/dtycrb54t/image/upload/v1742934963/bkyrpazaff2gck7wfta0.jpg",
            content: "Bạn đang làm gì đó? hhhhhh hhhhhh hhhhh hh hhhh hhh hhh hhh hh hh hhh hhh hh",
            time: "2025-04-10",
        },
    ];

    //---------------------------ListGroup------------------------
    const handleEdit = (id) => setEditMode({ type: "edit", id });
    const handleDelete = (id) => setEditMode({ type: "delete", id });
    const handleAdd = () => setEditMode({ type: "add" });

    const toggleMenu = (index, event) => {
        event.stopPropagation();
        setActiveMenu(activeMenu === index ? null : index);
    };

    const closeMenu = (event) => {
        if (menuRef.current && menuRef.current.contains(event.target)) return;
        setActiveMenu(null);
    };

    // useEffect(() => {
    //     document.addEventListener("click", closeMenu);
    //     return () => document.removeEventListener("click", closeMenu);
    // }, []);

    //------------------------------------------Message--------------------------------
    const toggleSearch = () => {
        setShowSearch(!showSearch);  // Thay đổi trạng thái khi bấm vào biểu tượng tìm kiếm
    };

    //Cuộn tới tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };   

    useEffect(() => {
        scrollToBottom();
    }, [realTimeMessages, messages, selectedConversationId]);
    

    // Hiển thị các tin nhắn
    const MessageItem = ({ message }) => {
        if (message.sender_id === account.id) {
            return (
                <div className="message-row right mt-3">
                    <div className="message-right">{message.content}</div>
                </div>
            );
        } else {
            return (
                <div className="message-row left mt-3">
                    <img className="avatarUser" src={message.avatar} />
                    <div className="message-wrapper">
                        {message.username && <span className="username">{message.username}</span>}
                        <div className="message-left">{message.content}</div>
                    </div>
                </div>
            );
        }
    };

    // Gửi tin nhắn
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedConversationId) return;

        const now = new Date();
        if (isNaN(now)) {
            console.error("Invalid date");
            return;
        }

        // Thử in ra ngày để kiểm tra
        console.log("Current date:", now);

        const localDate = now.toLocaleDateString("sv-SE"); // 'sv-SE' => định dạng YYYY-MM-DD

        if (!localDate) {
            console.error("Error formatting date");
            return;
        }


        const newMessage = {
            id: tempId,
            conversation_id: selectedConversationId,
            sender_id: account.id,
            avatar: account.avatar,
            username: account.fullName,
            content: messageText,
            time: localDate,
        };

        console.log("gửi: ", newMessage.time, newMessage.content)

        // Gửi qua socket
        

        socket.emit("send_message", newMessage);
        setMessageText("");
    };

    //Tham gia group
    const handleSelectGroup = (conversation_id) => {
        setSelectedConversationId(conversation_id);
        
        socket.emit("join_conversation", {
            conversation_id: conversation_id,
            user: account.fullName
        });
      };
      

    // Hiển thị các tin nhắn
    const groupedMessages = [...messages, ...realTimeMessages]
        .filter((m) => m.conversation_id === selectedConversationId)
        .reduce((acc, msg) => {
            // Chuyển msg.time sang định dạng ngày YYYY-MM-DD
            const dateObj = new Date(msg.time);
            const messageDate = dateObj.toISOString().split("T")[0]; // "YYYY-MM-DD"

            // Khởi tạo mảng nếu chưa có
            acc[messageDate] = acc[messageDate] || [];
            acc[messageDate].push(msg);

            return acc;
        }, {});



    useEffect(() => {
        if (!socket) return;

        // Bắt sự kiện click ngoài menu để đóng menu
        document.addEventListener("click", closeMenu);

        // Khi socket kết nối thành công
        const handleConnect = () => {
            console.log("🔌 Socket connected:", socket.id);
            setSocketConnected(true);
        };

        // Khi nhận tin nhắn mới
        const handleReceiveMessage = (message) => {
            console.log("📨 Received message:", message);

            // Đảm bảo đúng cuộc trò chuyện đang mở
            if (message.conversation_id === selectedConversationId) {
                setRealTimeMessages(prev => [...prev, message]);
            }
        };

        socket.on("receive_message", handleReceiveMessage);

        // Cleanup khi component unmount
        return () => {
            socket.off("receive_message", handleReceiveMessage);
            document.removeEventListener("click", closeMenu);
        };
    }, [socket, selectedConversationId]);

    return (
        <>
            {/* <BoxHead title="Danh sách trò chuyện" /> */}
            <div className="container-fluid">
                <div className="row align-items-start">
                    <div className="message col p-3 rounded shadow-sm border">
                        {/* Header */}
                        <div className="header_mess d-flex align-items-center justify-content-between p-3 border-bottom">
                            <div className="d-flex align-items-center">
                                <img
                                    src={groupItems.find((g) => g.id === selectedConversationId)?.img}
                                    alt="avatar"
                                    className="rounded-circle me-2"
                                    width="40"
                                    height="40"
                                />
                                <strong className="name_group mb-0">{groupItems.find((g) => g.id === selectedConversationId)?.name || "Chọn nhóm"}</strong>
                            </div>
                            <Form.Group className="mb-0 w-50">
                                <InputGroup size="sm">
                                    <Form.Control type="text" placeholder="Tìm kiếm..." />
                                    <InputGroup.Text>
                                        <FaSearch />
                                    </InputGroup.Text>
                                </InputGroup>
                            </Form.Group>
                        </div>

                        {/* Content (messages) */}
                        <div className="content_mes flex-grow-1 p-3 overflow-auto">
                            {Object.entries(groupedMessages).map(([date, msgs]) => (
                                <div key={date}>
                                    <div className="day-divider">{date}</div>
                                    {msgs.map((msg,index) => (
                                        <MessageItem key={msg._id || msg.id || `${msg.time}-${index}`} message={msg} />
                                    ))}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer (input) */}
                        <div className="footer_mess border-top p-3">
                            <Form className="d-flex align-items-center" onSubmit={handleSendMessage}>
                                <Form.Control type="text" placeholder="Aa" className="me-2" value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)} />
                                <button className="btn btn-primary" type="submit">Gửi</button>
                            </Form>
                        </div>
                    </div>

                    <div className="group col-3 p-3 ms-3 rounded shadow-sm border">
                        <button className="add-btn" onClick={handleAdd}>
                            <MdGroupAdd title="Thêm" size={25} />
                        </button>
                        <div className="listItem_group">
                            {groupItems.map((item, index) => (
                                <div
                                    className={`item_group ${selectedConversationId === item.id ? 'active' : ''}`}
                                    key={item.id}
                                    onClick={() => handleSelectGroup(item.id)}
                                >
                                    <img className="img_group" src={item.img} alt="anh" />
                                    <p className="name_group">{item.name}</p>
                                    <div className="actions">
                                        <button className="menu-btn" onClick={(e) => toggleMenu(index, e)}>
                                            <HiEllipsisHorizontal />
                                        </button>
                                        {activeMenu === index && (
                                            <div ref={menuRef} className="dropdown-menu">
                                                <div className="edit" onClick={() => handleEdit(item.id)}><MdEdit size={20} /><span>Sửa</span></div>
                                                <div className="del" onClick={() => handleDelete(item.id)}><MdDelete size={20} /><span>Xoá</span></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal chỉnh sửa hoặc xoá */}
            <Modal show={editMode !== null} onHide={() => setEditMode(null)} centered backdrop="static">
                <Modal.Header className="py-2">
                    <div className="modal-title h5">
                        {editMode?.type === "add" ? "Thêm nhóm" : editMode?.type === "edit" ? "Sửa nhóm" : "Xoá nhóm"}
                    </div>
                    <MdOutlineClose size={20} type="button" className="btn-close ms-auto" onClick={() => setEditMode(null)} aria-label="Close" />
                </Modal.Header>
                <Modal.Body>
                    {editMode?.type === "add" && (
                        <>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={3} className="d-flex align-items-center">
                                    Tên nhóm
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control type="Text" id="group_name" />
                                </Col>
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="danger" onClick={() => setEditMode(null)}>
                                    Thêm
                                </Button>
                                <Button variant="secondary" onClick={() => setEditMode(null)}>
                                    Hủy
                                </Button>
                            </div>
                        </>
                    )}

                    {editMode?.type === "edit" && (
                        <>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={3} className="d-flex align-items-center">
                                    Tên nhóm
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control type="Text" id="group_name" />
                                </Col>
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="danger" onClick={() => setEditMode(null)}>
                                    Lưu
                                </Button>
                                <Button variant="secondary" onClick={() => setEditMode(null)}>
                                    Hủy
                                </Button>
                            </div>
                        </>
                    )}

                    {editMode?.type === "delete" && (
                        <>
                            <p>Bạn có chắc chắn muốn xoá nhóm {editMode?.id ?? "này"} không?</p>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="danger" onClick={() => setEditMode(null)}>
                                    Xoá
                                </Button>
                                <Button variant="secondary" onClick={() => setEditMode(null)}>
                                    Hủy
                                </Button>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Conversation;

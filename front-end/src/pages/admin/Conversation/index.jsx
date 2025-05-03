import { useState, useRef, useEffect } from "react";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { MdDelete, MdEdit, MdGroupAdd, MdOutlineClose, MdSend } from "react-icons/md";
import { IoHeartSharp } from "react-icons/io5";
import { FaRegImage } from "react-icons/fa6";
import BoxHead from "../../../components/BoxHead";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Form, InputGroup } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaSearch } from "react-icons/fa";
import "./conversation.css";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid'; //Tạo id message
import { toast, Bounce } from "react-toastify";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import {
    create_conversation,
    get_all_conversations,
    update_conversation,
    delete_conversation
} from "../../../services/ConversationServices";
import { get_messages_by_conversation, create_message } from "../../../services/MessageServices";

const socket = io(import.meta.env.VITE_SOCKET);

function Conversation() {
    const [activeMenu, setActiveMenu] = useState(null);
    const [editMode, setEditMode] = useState(null); //thêm sửa xoá
    const [showSearch, setShowSearch] = useState(false);  // State để kiểm soát hiển thị ô tìm kiếm
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [socketConnected, setSocketConnected] = useState(false); //Kết nối socket
    const [realTimeMessages, setRealTimeMessages] = useState([]);

    const [conversations, setConversations] = useState([]);
    const [conversationName, setConversationName] = useState("");  // Lưu tên nhóm
    const [refresh, setRefresh] = useState(false);

    const menuRef = useRef(null);
    const tempId = uuidv4();
    const account = useSelector((state) => state.authenReducer.account); //user đang đăng nhập
    const messagesEndRef = useRef(null); //cuốn tới tin nhắn mới nhất

    const [imagePreview, setImagePreview] = useState(null); //ảnh nhóm
    const [avatarFile, setAvatarFile] = useState(null);
    const [messages, setMessages] = useState([]);

    //Tìm kiếm cuộc trò chuyện (nhóm)
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredConversations, setFilteredConversations] = useState(conversations || []);

    useEffect(() => {
        const filtered = conversations.filter((conv) =>
            conv.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredConversations(filtered);
    }, [searchTerm, conversations]);


    // Lấy Danh sách cuộc trò chuyện (group)
    useEffect(() => {
        const fetchAPI = async () => {
            try {
                const resultConversations = await get_all_conversations();
                setConversations(resultConversations.conversations);

                // Kiểm tra nếu danh sách cuộc trò chuyện có dữ liệu, chọn cuộc trò chuyện đầu tiên
                if (resultConversations.conversations && resultConversations.conversations.length > 0) {
                    setSelectedConversationId(resultConversations.conversations[0].id); // Lấy ID của cuộc trò chuyện đầu tiên
                    handleSelectGroup(resultConversations.conversations[0].id);
                }
                console.log("Lấy dữ liệu thành công!");
            } catch (error) {
                console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
                setConversations([]);  // Tránh lỗi khi request thất bại
            }
        };

        // Chỉ gọi API nếu danh sách cuộc trò chuyện chưa được tải
        // if (!conversations || conversations.length === 0) {
        fetchAPI();
        // }
    }, [refresh]);

    const reloadConversations = () => setRefresh((prev) => !prev);

    // Reset các giá trị khi không cần thiết
    const reset = () => {
        setEditMode(null);
        setAvatarFile(null);
        setImagePreview(null);
        setConversationName("");
    };

    // Lấy danh sách message theo conversation_id
    useEffect(() => {
        if (!selectedConversationId) return; // Tránh gọi API khi không có conversationId
        console.log("id: ", selectedConversationId);
        const fetchMessages = async () => {
            try {
                const response = await get_messages_by_conversation(selectedConversationId);
                console.log("API response:", response);
                setMessages(response.messages);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tin nhắn:", error);
                setMessages([]);  // Tránh lỗi khi request thất bại
            }
        };

        fetchMessages();
    }, [selectedConversationId]);

    //---------------------------ListGroup------------------------
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setAvatarFile(file);
        } else {
            setImagePreview(null);
            setAvatarFile(null);
        }
    };

    // set dữ liệu khi sửa
    const handleEdit = (id) => {
        const group = conversations.find((g) => g.id === id);
        if (group) {
            setConversationName(group.name || "");
            setImagePreview(group.img || null);
            setAvatarFile(null); // Không cần file mới khi chỉ sửa tên hoặc xem ảnh cũ
            setEditMode({ type: "edit", id });
        }
    };

    const handleUpdate = async (name) => {
        try {
            let avatarUrl = imagePreview;

            // Nếu người dùng chọn file mới thì upload
            if (avatarFile) {
                avatarUrl = await uploadToCloudinary(avatarFile);
                if (!avatarUrl) {
                    alert("Lỗi khi tải ảnh lên Cloudinary!");
                    return;
                }
            }

            const updateConversation = { name, img: avatarUrl }
            const response = await update_conversation(editMode?.id, updateConversation);
            if (response.message) {
                toast.success("Cập nhật thành công!", { transition: Bounce });
                reset();
                reloadConversations();
            } else {
                toast.error("Cập nhật thất bại!", { transition: Bounce });
            }
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi cập nhật nhóm!", { transition: Bounce });
        }
    };

    const handleDelete = async () => {
        try {
            const response = await delete_conversation(selectedConversationId);
            if (response.message) {
                toast.success("Xoá thành công!", { transition: Bounce });
                setEditMode(null);
                reloadConversations();
            } else {
                toast.error("Xoá thất bại!", { transition: Bounce });
            }
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi xoá nhóm!", { transition: Bounce });
        }
    };

    const handleAdd = async (name) => {
        try {
            let avatarUrl = null;

            if (avatarFile) {
                avatarUrl = await uploadToCloudinary(avatarFile);
                if (!avatarUrl) {
                    alert("Lỗi khi tải ảnh lên Cloudinary!");
                    return;
                }
            }

            const newGroup = { name, img: avatarUrl };
            const response = await create_conversation(newGroup);

            console.log("Tạo nhóm - phản hồi:", response);

            if (response.message) {
                toast.success('Thêm thành công!', { transition: Bounce });
                reset();
                reloadConversations();
            } else {
                toast.error('Không nhận được dữ liệu nhóm từ server.', { transition: Bounce });
            }
        } catch (error) {
            console.error("Lỗi khi tạo nhóm:", error);
            toast.error('Lỗi khi tạo nhóm!', { transition: Bounce });
        }
    };


    const toggleMenu = (index, event) => {
        event.stopPropagation();
        setActiveMenu(activeMenu === index ? null : index);
    };

    const closeMenu = (event) => {
        if (menuRef.current && menuRef.current.contains(event.target)) return;
        setActiveMenu(null);
    };

    useEffect(() => {
        document.addEventListener("mousedown", closeMenu);
        return () => {
            document.removeEventListener("mousedown", closeMenu);
        };
    }, []);


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


    const MessageItem = ({ message }) => {
        const avatar = message.sender_avatar || "default-avatar-path.jpg";
        const senderName = message.sender_name || "Unknown Sender";
        const messageTime = message.createdAt || "";
        const content = message.content || "";

        const isCurrentUser = message.sender_id === account.id;

        const renderMessageContent = () => {
            if (message.type === "IMAGE") {
                return (
                    <img
                        src={content}
                        alt="sent"
                        style={{
                            maxWidth: "200px",
                            borderRadius: "8px",
                            objectFit: "cover",
                        }}
                    />
                );
            }
            return content;
        };

        if (isCurrentUser) {
            return (
                <div className="message-row right mt-3">
                    <div className="message-right">
                        {renderMessageContent()}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="message-row left mt-3">
                    <img className="avatarUser" src={avatar} alt={senderName} />
                    <div className="message-wrapper">
                        <span className="username">{senderName}</span>
                        <div className="message-left">
                            {renderMessageContent()}
                        </div>
                    </div>
                </div>
            );
        }
    };

    const handleSendImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        handleSendMessage(null, file, "IMAGE");
    };

    // Gửi tin nhắn
    const handleSendMessage = async (e, customContent = null, customType = "TEXT") => {
        if (e) e.preventDefault();

        let content = customContent !== null ? customContent : messageText.trim();
        let avatarUrl = null;

        if (customType === "IMAGE" && content instanceof File) {
            try {
                avatarUrl = await uploadToCloudinary(content);
                if (!avatarUrl) {
                    toast.error("Lỗi khi tải ảnh lên Cloudinary!", { transition: Bounce });
                    return;
                }
                content = avatarUrl;
            } catch (error) {
                console.error("Lỗi khi upload ảnh:", error);
                toast.error('Lỗi khi upload ảnh!', { transition: Bounce });
                return;
            }
        }

        if (!content || !selectedConversationId) return;

        const newMessage = {
            id: uuidv4(),
            conversation_id: selectedConversationId,
            sender_id: account.id,
            sender_name: account.fullName,
            sender_avatar: account.avatar,
            content: content,
            createdAt: new Date().toISOString(),
            type: customType,
        };

        socket.emit("send_message", newMessage);

        try {
            const result = await create_message(newMessage);
            if (result && result.message) {
                // Có thể cập nhật lại danh sách nếu cần
            } else {
                throw new Error("Lỗi phản hồi từ server khi gửi tin nhắn.");
            }
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            toast.error('Lỗi khi gửi tin nhắn!', { transition: Bounce });
        }

        if (customType === "TEXT") {
            setMessageText("");
        }
    };

    //Tham gia group
    const handleSelectGroup = (conversation_id) => {
        setSelectedConversationId(conversation_id);
        setRealTimeMessages([]);

        socket.emit("join_conversation", {
            conversation_id: conversation_id,
            user: account.fullName
        });
    };


    // Hiển thị các tin nhắn
    const groupedMessages = [...messages, ...realTimeMessages]
        .filter((m) => m.conversation_id === selectedConversationId)
        .reduce((acc, msg) => {
            let messageDate = "";

            try {
                const dateObj = new Date(msg.createdAt);

                if (!isNaN(dateObj)) {
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = dateObj.getFullYear();

                    messageDate = `${day}/${month}/${year}`;
                }
            } catch (e) {
                console.error("Lỗi phân tích ngày:", msg.createdAt);
            }

            acc[messageDate] = acc[messageDate] || [];
            acc[messageDate].push(msg);

            return acc;
        }, {});


    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            console.log("Received message:", message);
            setRealTimeMessages((prev) => {
                const isDuplicate = prev.some(m => m.id === message.id);
                return isDuplicate ? prev : [...prev, message];
            });
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [socket]);


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
                                    src={conversations.find((g) => g.id === selectedConversationId)?.img}
                                    alt="avatar"
                                    className="rounded-circle me-2"
                                    width="60"
                                    height="60"
                                />
                                <strong className="name_group mb-0">{conversations.find((g) => g.id === selectedConversationId)?.name || "Chọn nhóm"}</strong>
                            </div>
                        </div>

                        {/* Content (messages) */}
                        <div className="content_mes flex-grow-1 p-3 overflow-auto">
                            {Object.entries(groupedMessages).map(([date, msgs]) => (
                                <div key={date}>
                                    <div className="day-divider">{date}</div>
                                    {msgs
                                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // sắp xếp theo thời gian tăng dần
                                        .map((msg, index) => (
                                            <MessageItem key={msg.id || `${msg.createdAt}-${index}`} message={msg} />
                                        ))}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer (input) */}
                        <div className="footer_mess border-top p-3">
                            <Form className="d-flex align-items-center" onSubmit={handleSendMessage}>
                                <div className="send-image ms-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleSendImage}
                                        style={{ display: "none" }} // Ẩn input file
                                        id="image-upload"
                                        disabled={!selectedConversationId}
                                    />
                                    <label htmlFor="image-upload" style={{ cursor: selectedConversationId ? "pointer" : "not-allowed", opacity: selectedConversationId ? 1 : 0.5 }}>
                                        <FaRegImage size={35} color="#394867" />
                                    </label>
                                </div>
                                <Form.Control type="text" placeholder="Aa" className="me-2 ms-3" value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    disabled={!selectedConversationId} />
                                <button type="submit" className="btn btn-primary btn-send ms-2" disabled={!selectedConversationId}
                                    style={{ cursor: selectedConversationId ? "pointer" : "not-allowed", opacity: selectedConversationId ? 1 : 0.5 }}>
                                    <MdSend size={35} color="#394867" />
                                </button>
                                <div className="heart ms-2" onClick={() => handleSendMessage(null, "❤️", "EMOJI")}
                                    style={{ cursor: selectedConversationId ? "pointer" : "not-allowed", opacity: selectedConversationId ? 1 : 0.5 }}>
                                    <IoHeartSharp size={35} color="red" />
                                </div>
                            </Form>
                        </div>
                    </div>

                    {/* Phần hiển thị nhóm */}
                    <div className="group col-3 p-3 ms-3 rounded shadow-sm border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <Form.Group className="mb-0 w-75">
                                <InputGroup size="sm">
                                    <Form.Control type="text" placeholder="Tìm kiếm..." value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)} disabled={!selectedConversationId}/>
                                    <InputGroup.Text>
                                        <FaSearch />
                                    </InputGroup.Text>
                                </InputGroup>
                            </Form.Group>

                            <button className="add-btn ms-2" onClick={() => setEditMode({ type: "add" })}>
                                <MdGroupAdd title="Thêm" size={25} />
                            </button>
                        </div>
                        <div className="listItem_group">
                            {Array.isArray(filteredConversations) && filteredConversations.length > 0 ? (
                                filteredConversations.map((item, index) => (
                                    <div
                                        className={`item_group ${selectedConversationId === item.id ? 'active' : ''}`}
                                        key={item.id}
                                        onClick={() => handleSelectGroup(item.id)}
                                    >
                                        <img className="img_group" src={item.img || 'default-image-path.jpg'} alt="anh" />
                                        <p className="name_group">{item.name}</p>
                                        <div className="actions">
                                            <button className="menu-btn" onClick={(e) => toggleMenu(index, e)}>
                                                <HiEllipsisHorizontal />
                                            </button>
                                            {activeMenu === index && (
                                                <div ref={menuRef} className="dropdown-menu">
                                                    <div className="edit" onClick={() => handleEdit(item.id)}>
                                                        <MdEdit size={20} />
                                                        <span>Sửa</span>
                                                    </div>
                                                    <div className="del" onClick={() => {
                                                        setEditMode({ type: "delete", id: item.id, name: item.name });
                                                    }}>
                                                        <MdDelete size={20} />
                                                        <span>Xoá</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-conversations" style={{ textAlign: "center", padding: "20px" }}>
                                    Không có cuộc trò chuyện nào
                                </div>
                            )}
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
                            {/* Nhập tên nhóm */}
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={3} className="d-flex align-items-center">
                                    Tên nhóm
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên nhóm"
                                        value={conversationName}
                                        onChange={(e) => setConversationName(e.target.value)}
                                    />
                                </Col>
                            </Form.Group>

                            {/* Chọn ảnh đại diện nhóm */}
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={3} className="d-flex align-items-center">
                                    Ảnh đại diện
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview && (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="mt-2 rounded border"
                                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                        />
                                    )}
                                </Col>
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="danger" onClick={() => {
                                    handleAdd(conversationName); // Gọi hàm handleAdd để thêm cuộc trò chuyện
                                }}>
                                    Thêm
                                </Button>
                                <Button type="button" style={{ backgroundColor: '#394867', color: 'white', border: 'none' }} onClick={() => reset()}>
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
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên nhóm"
                                        value={conversationName}
                                        onChange={(e) => setConversationName(e.target.value)}
                                    />
                                </Col>
                            </Form.Group>

                            {/* Chọn ảnh đại diện nhóm */}
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={3} className="d-flex align-items-center">
                                    Ảnh đại diện
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview && (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="mt-2 rounded border"
                                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                        />
                                    )}
                                </Col>
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="danger" onClick={() => handleUpdate(conversationName)}>
                                    Lưu
                                </Button>
                                <Button type="button" style={{ backgroundColor: '#394867', color: 'white', border: 'none' }} onClick={() => reset()}>
                                    Hủy
                                </Button>
                            </div>
                        </>
                    )}

                    {editMode?.type === "delete" && (
                        <>
                            <p>Bạn có chắc chắn muốn xoá nhóm {editMode?.name ?? "này"} không?</p>
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="danger" onClick={() => handleDelete()}>
                                    Xoá
                                </Button>
                                <Button type="button" style={{ backgroundColor: '#394867', color: 'white', border: 'none' }} onClick={() => reset()}>
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

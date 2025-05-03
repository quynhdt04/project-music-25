import { useState, useRef, useEffect } from "react";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { MdDelete, MdEdit, MdGroupAdd, MdOutlineClose, MdSend } from "react-icons/md";
import { IoHeartSharp } from "react-icons/io5";
import { FaRegImage } from "react-icons/fa6";
import BoxHead from "../../../components/BoxHead";
import Button from "react-bootstrap/Button";
import { Form, InputGroup } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaSearch } from "react-icons/fa";
import "./conv.css";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid'; //Tạo id message
import { toast, Bounce } from "react-toastify";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";
import {
    get_all_conversations,
} from "../../../services/ConversationServices";
import { get_messages_by_conversation, create_message } from "../../../services/MessageServices";

const socket = io(import.meta.env.VITE_SOCKET);

function ConversationClient() {
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [socketConnected, setSocketConnected] = useState(false); //Kết nối socket
    const [realTimeMessages, setRealTimeMessages] = useState([]);

    const [conversations, setConversations] = useState([]);
    const [conversationName, setConversationName] = useState("");  // Lưu tên nhóm
    const [refresh, setRefresh] = useState(false);

    const menuRef = useRef(null);
    const tempId = uuidv4();
    const account = useSelector((state) => state.authenReducer.user); //user đang đăng nhập
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
        if (!conversations || conversations.length === 0) {
            fetchAPI();
        }
    }, [refresh]);


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

    //------------------------------------------Message--------------------------------
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
                <div className="message-row left client mt-3">
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
            <div className="container-fluid">
                <div className="row align-items-start">
                    <div className="message-client col p-1 rounded shadow-sm">
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
                                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // sắp xếp theo thời gian
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
                                <div className="send-image">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleSendImage}
                                        style={{ display: "none" }} // Ẩn input file
                                        id="image-upload"
                                        disabled={!selectedConversationId}
                                    />
                                    <label htmlFor="image-upload" style={{ cursor: selectedConversationId ? "pointer" : "not-allowed", opacity: selectedConversationId ? 1 : 0.5 }}>
                                        <FaRegImage size={35} color="#fff" />
                                    </label>
                                </div>
                                <Form.Control type="text" placeholder="Aa" className="me-2 ms-3" value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    disabled={!selectedConversationId}
                                />
                                <button type="submit" className="btn-send btn-primary ms-2" disabled={!selectedConversationId}
                                    style={{ cursor: selectedConversationId ? "pointer" : "not-allowed", opacity: selectedConversationId ? 1 : 0.5 }}>
                                    <MdSend size={35} color="#fff" />
                                </button>
                                <div className="heart ms-2" onClick={() => handleSendMessage(null, "❤️", "EMOJI")}
                                    style={{ cursor: selectedConversationId ? "pointer" : "not-allowed", opacity: selectedConversationId ? 1 : 0.5 }}>
                                    <IoHeartSharp size={35} color="red" />
                                </div>
                            </Form>
                        </div>
                    </div>

                    {/* Phần hiển thị nhóm */}
                    <div className="group-client col-3 p-3 ms-3 rounded shadow-sm">
                        <div className="mb-2 search d-flex justify-content-end">
                            <Form.Group className="mb-0 w-75">
                                <InputGroup size="sm">
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        disabled={!selectedConversationId}
                                    />
                                    <InputGroup.Text>
                                        <FaSearch />
                                    </InputGroup.Text>
                                </InputGroup>
                            </Form.Group>
                        </div>
                        <div className="listItem_group_client">
                            {Array.isArray(filteredConversations) && filteredConversations.length > 0 ? (
                                filteredConversations.map((item, index) => (
                                    <div
                                        className={`item_group ${selectedConversationId === item.id ? 'active' : ''}`}
                                        key={item.id}
                                        onClick={() => handleSelectGroup(item.id)}
                                    >
                                        <img className="img_group" src={item.img || 'default-image-path.jpg'} alt="anh" />
                                        <p className="name_group">{item.name}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="no-conversations" style={{ textAlign: "center", padding: "20px", color:"white" }}>
                                    Không có cuộc trò chuyện nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}

export default ConversationClient;

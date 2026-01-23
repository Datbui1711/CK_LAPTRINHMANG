import { useContext, useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";

import { formatTime } from "../../../../utils/helper";
import { ChatRefContext } from "../../../../contexts/AppContext";
import { addReaction, removeReaction } from "../../../../services/reactionService";
import ReactionPicker from "../../../../components/ReactionPicker/ReactionPicker";
import socket from "../../../../socket";
import useToastActions from "../../../../hooks/useToastActions";

import styles from "./Message.module.css";

function Message({ isSent, message, currentUserId, isGroupChat }) {
    const { chatRef, scrollToBottom } = useContext(ChatRefContext);
    const [fullMedia, setFullMedia] = useState(null);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [reactions, setReactions] = useState(message.reactions || []);
    const [pickerPosition, setPickerPosition] = useState(null);
    const messageRef = useRef(null);
    const toast = useToastActions();

    useEffect(() => {
        setReactions(message.reactions || []);
    }, [message.reactions]);

    useEffect(() => {
        const handleReactionUpdate = (data) => {
            if (data.messageId === message._id) {
                setReactions(data.reactions || []);
            }
        };

        socket.on("reactionUpdated", handleReactionUpdate);

        return () => {
            socket.off("reactionUpdated", handleReactionUpdate);
        };
    }, [message._id]);

    const handleMediaLoad = () => {
        if (scrollToBottom.current && chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    };

    const handleMediaClick = () => {
        setFullMedia({
            type: message.type,
            url: import.meta.env.VITE_BACKEND_URL + message.content,
        });
    };

    const handleClose = () => {
        setFullMedia(null);
    };

    const handleReactionButtonClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Đóng picker cũ nếu có
        if (showReactionPicker) {
            setShowReactionPicker(false);
            setPickerPosition(null);
            return;
        }
        
        const buttonRect = e.currentTarget.getBoundingClientRect();
        const pickerWidth = 220;
        const pickerHeight = 160;
        const spacing = 8;
        
        // Tính toán vị trí để picker hiển thị phía trên button (ưu tiên)
        // Căn giữa picker với button
        let x = buttonRect.left + (buttonRect.width / 2) - (pickerWidth / 2);
        let y = buttonRect.top - pickerHeight - spacing;
        
        // Đảm bảo picker không bị tràn ra ngoài màn hình bên trái
        if (x < spacing) {
            x = spacing;
        }
        
        // Đảm bảo picker không bị tràn ra ngoài màn hình bên phải
        if (x + pickerWidth > window.innerWidth - spacing) {
            x = window.innerWidth - pickerWidth - spacing;
        }
        
        // Nếu không đủ chỗ phía trên, hiển thị phía dưới
        if (y < spacing) {
            y = buttonRect.bottom + spacing;
        }
        
        // Đảm bảo picker không bị tràn ra ngoài màn hình phía dưới
        if (y + pickerHeight > window.innerHeight - spacing) {
            // Thử đặt ở giữa màn hình theo chiều dọc
            y = (window.innerHeight - pickerHeight) / 2;
        }
        
        // Đảm bảo y không âm và không vượt quá màn hình
        y = Math.max(spacing, Math.min(y, window.innerHeight - pickerHeight - spacing));
        
        const newPosition = { 
            x: Math.round(x), 
            y: Math.round(y) 
        };
        
        setPickerPosition(newPosition);
        setShowReactionPicker(true);
    };

    const handleReactionSelect = async (emoji) => {
        if (!message._id) {
            toast.error("Tin nhắn chưa có ID", "Lỗi", { duration: 3000 });
            return;
        }

        try {
            const existingReaction = reactions.find((r) => r.emoji === emoji);
            const userReacted = existingReaction?.users?.some(
                (user) => (user._id || user).toString() === currentUserId.toString()
            );

            if (userReacted) {
                // Remove reaction
                await removeReaction(message._id, emoji);
                socket.emit("removeReaction", { messageId: message._id, emoji });
            } else {
                // Add reaction
                await addReaction(message._id, emoji);
                socket.emit("addReaction", { messageId: message._id, emoji });
            }
        } catch (err) {
            toast.error(err.message || "Không thể thêm reaction", "Lỗi", {
                duration: 3000,
            });
        }
    };

    const handleReactionClick = async (emoji, e) => {
        e.stopPropagation();
        await handleReactionSelect(emoji);
    };

    const hasUserReacted = (reaction) => {
        return reaction.users?.some(
            (user) => (user._id || user).toString() === currentUserId.toString()
        );
    };

    // Lấy tên người gửi cho group chat
    // Xử lý cả trường hợp from là object (đã populate) hoặc ObjectId string
    const getSenderName = () => {
        if (!isGroupChat || isSent || !message.from) {
            return null;
        }
        
        // Nếu from là object (đã populate)
        if (typeof message.from === 'object' && message.from !== null) {
            return message.from.name || message.from.email || "Người dùng";
        }
        
        // Nếu from là ObjectId string, không thể lấy tên (cần populate từ backend)
        return null;
    };
    
    const senderName = getSenderName();

    return (
        <>
            <div
                ref={messageRef}
                className={`${styles["message"]} ${
                    isSent ? styles["sent"] : styles["received"]
                }`}
            >
                {senderName && (
                    <div className={styles["sender-name"]}>
                        {senderName}
                    </div>
                )}
                <div
                    className={`${styles["message-content"]} ${
                        message.type === "text"
                            ? styles["text-message"]
                            : styles["media-message"]
                    }`}
                >
                    {message.type === "image" ? (
                        <img
                            src={
                                import.meta.env.VITE_BACKEND_URL +
                                message.content
                            }
                            alt="Uploaded"
                            onClick={handleMediaClick}
                            onLoad={handleMediaLoad}
                            className={styles["message-image"]}
                        />
                    ) : message.type === "video" ? (
                        <div
                            className={styles["video-wrapper"]}
                            onClick={handleMediaClick}
                        >
                            <video
                                src={
                                    import.meta.env.VITE_BACKEND_URL +
                                    message.content
                                }
                                onLoad={handleMediaLoad}
                                className={styles["message-video"]}
                                muted
                            />
                            <div className={styles["video-overlay"]}>
                                <span className={styles["play-icon"]}>▶</span>
                            </div>
                        </div>
                    ) : (
                        message.content
                    )}
                </div>

                {reactions.length > 0 && (
                    <div className={styles["reactions-container"]}>
                        {reactions.map((reaction, index) => (
                            <button
                                key={index}
                                className={`${styles["reaction-button"]} ${
                                    hasUserReacted(reaction)
                                        ? styles["reacted"]
                                        : ""
                                }`}
                                onClick={(e) => handleReactionClick(reaction.emoji, e)}
                                title={reaction.users
                                    ?.map((user) => user.name || user.email)
                                    .join(", ")}
                            >
                                <span className={styles["reaction-emoji"]}>
                                    {reaction.emoji}
                                </span>
                                <span className={styles["reaction-count"]}>
                                    {reaction.users?.length || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                <div className={styles["message-footer"]}>
                    <button
                        className={styles["add-reaction-button"]}
                        onClick={handleReactionButtonClick}
                        aria-label="Thêm reaction"
                    >
                        <Smile size={14} />
                    </button>
                <div className={styles["message-time"]}>
                    {formatTime(message.createdAt)}
                </div>
                </div>

                {showReactionPicker && pickerPosition && (
                    <ReactionPicker
                        onSelect={handleReactionSelect}
                        onClose={() => {
                            setShowReactionPicker(false);
                            setPickerPosition(null);
                        }}
                        position={pickerPosition}
                    />
                )}
            </div>

            {fullMedia && (
                <div className={styles["overlay"]} onClick={handleClose}>
                    {fullMedia.type === "image" ? (
                        <img
                            src={fullMedia.url}
                            alt="Full view"
                            className={styles["fullscreen-image"]}
                        />
                    ) : (
                        <video
                            src={fullMedia.url}
                            className={styles["fullscreen-video"]}
                            controls
                            autoPlay
                        />
                    )}
                </div>
            )}
        </>
    );
}

export default Message;

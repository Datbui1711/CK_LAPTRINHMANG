import Message from "../Message/Message";
import styles from "./MessageList.module.css";

function MessageList({ ref, onScroll, messages, currentUserId, loadingMore, isGroupChat }) {
    return (
        <div ref={ref} onScroll={onScroll} className={styles["chat-messages"]}>
            <div>
                {loadingMore && (
                    <div className={styles["loading-more-container"]}>
                        <div className={styles["loading-more"]}>
                            <div className={styles["loading-spinner"]}></div>
                            <div className={styles["loading-text"]}>
                                Đang tải tin nhắn...
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {messages.length === 0 ? (
                <div className={styles["no-messages"]}>
                    Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
                </div>
            ) : (
                messages.map((msg, i) => {
                    const msgFromId = msg.from?._id || msg.from;
                    return (
                        <Message
                            key={msg._id || `msg-${i}`}
                            isSent={msgFromId === currentUserId}
                            message={msg}
                            currentUserId={currentUserId}
                            isGroupChat={isGroupChat}
                        />
                    );
                })
            )}
        </div>
    );
}

export default MessageList;

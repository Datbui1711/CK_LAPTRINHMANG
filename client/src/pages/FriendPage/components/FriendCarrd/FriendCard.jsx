import { useState } from "react";

import styles from "./FriendCard.module.css";

function FriendCard({ friend }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`${styles.card} ${isExpanded ? styles.expanded : ""}`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className={styles.mainContent}>
                <div className={styles.avatarContainer}>
                    <div className={styles["friend-avatar"]}>
                        {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                        className={`${styles.status} ${styles[status]}`}
                    ></span>
                </div>

                <div className={styles.info}>
                    <h3 className={styles.name}>{friend.name}</h3>
                    <p className={styles.email}>{friend.email}</p>
                </div>

                <div className={styles.expandIcon}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {isExpanded ? (
                            <polyline points="18 15 12 9 6 15"></polyline>
                        ) : (
                            <polyline points="6 9 12 15 18 9"></polyline>
                        )}
                    </svg>
                </div>
            </div>

            {isExpanded && (
                <div className={styles.expandedContent}>
                    <div className={styles.actions}>
                        <button className={styles.actionButton}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            Gọi
                        </button>
                        <button className={styles.actionButton}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            Nhắn tin
                        </button>
                        <button className={styles.actionButton}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="19" cy="12" r="1"></circle>
                                <circle cx="5" cy="12" r="1"></circle>
                            </svg>
                            Thêm
                        </button>
                    </div>
                    {/* <div className={styles.details}>
                        <p className={styles.lastActive}>
                            {status === "online"
                                ? "Đang hoạt động"
                                : `Hoạt động ${lastActive || "cách đây 2 giờ"}`}
                        </p>
                    </div> */}
                </div>
            )}
        </div>
    );
}

export default FriendCard;

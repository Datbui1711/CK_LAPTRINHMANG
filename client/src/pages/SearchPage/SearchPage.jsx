import { useEffect, useState } from "react";
import { Search, UserPlus, MessageCircle, Check, Clock, X } from "lucide-react";

import {
    acceptFriendRequest,
    rejectFriendRequest,
    searchUsersToAddFriend,
    sendFriendRequest,
} from "../../services/friendService";

import styles from "./SearchPage.module.css";
import { useDebounce } from "../../hooks/useDebounce";
import useToastActions from "../../hooks/useToastActions";

function SearchPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [userStates, setUserStates] = useState({});
    const [processingIds, setProcessingIds] = useState(new Set());

    const toast = useToastActions();

    const debouncedSearchTerm = useDebounce(searchTerm.trim(), 500);

    useEffect(() => {
        const fetchUserToAdd = async () => {
            // Cho phép tìm kiếm với ít nhất 2 ký tự (tên hoặc email)
            if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const response = await searchUsersToAddFriend(
                    debouncedSearchTerm
                );
                setSearchResults(response || []);
            } catch (err) {
                console.error(err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        fetchUserToAdd();
    }, [debouncedSearchTerm]);

    const handleSendFriendRequest = async (userId) => {
        setUserStates((prev) => ({ ...prev, [userId]: "sending" }));

        try {
            const response = await sendFriendRequest(userId);
            setUserStates((prev) => ({ ...prev, [userId]: "sent" }));
            setSearchResults((prev) =>
                prev.map((user) =>
                    user._id === userId ? { ...user, sentRequest: true } : user
                )
            );
            toast.success(
                response.message || "Gửi lời mời kết bạn thành công",
                "Thông báo",
                {
                    duration: 6000,
                }
            );
        } catch (err) {
            setUserStates((prev) => ({ ...prev, [userId]: "idle" }));
            toast.error(
                err.message || "Gửi lời mời kết bạn không thành công",
                "Lỗi hệ thống",
                {
                    duration: 6000,
                }
            );
        }
    };

    const handleAccept = async (id) => {
        setProcessingIds((prev) => new Set(prev).add(id));

        try {
            const response = await acceptFriendRequest(id);
            setSearchResults((prev) =>
                prev.map((user) =>
                    user._id === id
                        ? {
                              ...user,
                              isFriend: true,
                              receivedRequest: false,
                              sentRequest: false,
                          }
                        : user
                )
            );
            toast.success(
                response.message || "Chấp nhận lời mời kết bạn thành công",
                "Thông báo",
                {
                    duration: 6000,
                }
            );
        } catch (err) {
            toast.error(
                err.message || "Chấp nhận lời mời kết bạn không thành công",
                "Lỗi hệ thống",
                {
                    duration: 6000,
                }
            );
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const handleDecline = async (id) => {
        setProcessingIds((prev) => new Set(prev).add(id));

        try {
            const response = await rejectFriendRequest(id);
            setSearchResults((prev) =>
                prev.map((user) =>
                    user._id === id
                        ? {
                              ...user,
                              receivedRequest: false,
                              sentRequest: false,
                              isFriend: false,
                          }
                        : user
                )
            );
            toast.success(
                response.message || "Từ chối lời mời kết bạn thành công",
                "Thông báo",
                {
                    duration: 6000,
                }
            );
        } catch (err) {
            toast.error(
                err.message || "Từ chối lời mời kết bạn không thành công",
                "Lỗi hệ thống",
                {
                    duration: 6000,
                }
            );
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const renderActionButton = (user) => {
        const userState = userStates[user._id];

        if (user.isFriend) {
            return (
                <button
                    disabled
                    className={`${styles.actionButton} ${styles.messageButton}`}
                >
                    <MessageCircle className={styles.buttonIcon} />
                    Nhắn tin
                </button>
            );
        }

        if (userState === "sent" || user.sentRequest) {
            return (
                <button
                    disabled
                    className={`${styles.actionButton} ${styles.sentButton}`}
                >
                    <Clock className={styles.buttonIcon} />
                    Đã gửi
                </button>
            );
        }

        if (user.receivedRequest) {
            return (
                <div className={styles.receivedActions}>
                    <button
                        onClick={() => handleAccept(user._id)}
                        disabled={processingIds.has(user._id)}
                        className={`${styles.actionButton} ${styles.acceptButton}`}
                    >
                        <Check className={styles.buttonIcon} />
                        {processingIds.has(user._id)
                            ? "Đang xử lý..."
                            : "Chấp nhận"}
                    </button>
                    <button
                        onClick={() => handleDecline(user._id)}
                        disabled={processingIds.has(user._id)}
                        className={`${styles.actionButton} ${styles.declineButton}`}
                    >
                        <X className={styles.buttonIcon} />
                        {processingIds.has(user._id)
                            ? "Đang xử lý..."
                            : "Từ chối"}
                    </button>
                </div>
            );
        }

        return (
            <button
                onClick={() => handleSendFriendRequest(user._id)}
                disabled={userState === "sending"}
                className={`${styles.actionButton} ${styles.addButton}`}
            >
                <UserPlus className={styles.buttonIcon} />
                {userState === "sending" ? "Đang gửi..." : "Kết bạn"}
            </button>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Tìm kiếm người dùng</h1>
                <p className={styles.subtitle}>
                    Tìm kiếm và kết nối với bạn bè mới
                </p>
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchInputContainer}>
                    <Search className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    {isSearching && (
                        <div className={styles.loadingSpinner}></div>
                    )}
                </div>
            </div>

            <div className={styles.resultsSection}>
                {searchTerm && !isSearching && (
                    <div className={styles.resultsHeader}>
                        <span className={styles.resultsCount}>
                            {searchResults.length} kết quả cho "{searchTerm}"
                        </span>
                    </div>
                )}

                {searchResults.length > 0 && (
                    <div className={styles.resultsList}>
                        {searchResults.map((user) => (
                            <div key={user._id} className={styles.userCard}>
                                <div className={styles.userInfo}>
                                    <div className={styles["friend-avatar"]}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.userDetails}>
                                        <h3 className={styles.userName}>
                                            {user.name}
                                        </h3>
                                        <p className={styles.userEmail}>
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.userActions}>
                                    {renderActionButton(user)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {searchTerm && !isSearching && searchResults.length === 0 && (
                    <div className={styles.noResults}>
                        <Search className={styles.noResultsIcon} />
                        <h3 className={styles.noResultsTitle}>
                            Không tìm thấy kết quả
                        </h3>
                        <p className={styles.noResultsText}>
                            Không có người dùng nào phù hợp với từ khóa "
                            {searchTerm}"
                        </p>
                    </div>
                )}

                {!searchTerm && (
                    <div className={styles.emptyState}>
                        <Search className={styles.emptyIcon} />
                        <h3 className={styles.emptyTitle}>
                            Tìm kiếm người dùng
                        </h3>
                        <p className={styles.emptyText}>
                            Nhập tên hoặc email để tìm kiếm và kết nối với
                            bạn bè mới
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchPage;

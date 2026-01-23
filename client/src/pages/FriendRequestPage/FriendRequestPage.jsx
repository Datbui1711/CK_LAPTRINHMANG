import { useState } from "react";
import { Check, X, UserPlus } from "lucide-react";
import { useEffect } from "react";

import Loading from "../../components/Loading";
import {
    acceptFriendRequest,
    getFriendRequests,
    rejectFriendRequest,
} from "../../services/friendService";
import useToastActions from "../../hooks/useToastActions";

import styles from "./FriendRequestPage.module.css";
import { getTimeAgoLabel } from "../../utils/helper";

function FriendRequestPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingIds, setProcessingIds] = useState(new Set());

    const toast = useToastActions();

    useEffect(() => {
        const fetchFriendRequests = async () => {
            setLoading(true);
            try {
                const response = await getFriendRequests();
                setRequests(response || []);
            } catch (err) {
                console.log(err);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendRequests();
    }, []);

    const handleAccept = async (id) => {
        setProcessingIds((prev) => new Set(prev).add(id));

        try {
            const response = await acceptFriendRequest(id);
            setRequests((prev) =>
                prev.filter((request) => request.user._id !== id)
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
            setRequests((prev) =>
                prev.filter((request) => request.user._id !== id)
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

    if (loading) {
        return <Loading fullScreen={true} text="Đang tải..." />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <UserPlus className={styles.headerIcon} />
                    <h1 className={styles.title}>Lời mời kết bạn</h1>
                </div>
                <div className={styles.counter}>{requests.length} lời mời</div>
            </div>

            {requests.length === 0 ? (
                <div className={styles.emptyState}>
                    <UserPlus className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>
                        Không có lời mời kết bạn nào
                    </h3>
                    <p className={styles.emptyDescription}>
                        Khi có người gửi lời mời kết bạn, chúng sẽ xuất hiện ở
                        đây.
                    </p>
                </div>
            ) : (
                <div className={styles.requestsList}>
                    {requests.map((request) => (
                        <div
                            key={request.user._id}
                            className={styles.requestCard}
                        >
                            <div className={styles["friend-avatar"]}>
                                {request.user.name.charAt(0).toUpperCase()}
                            </div>

                            <div className={styles.userInfo}>
                                <h3 className={styles.userName}>
                                    {request.user.name}
                                </h3>
                                <p className={styles.userEmail}>
                                    {request.user.email}
                                </p>
                                <div className={styles.metadata}>
                                    <span className={styles.requestDate}>
                                        {getTimeAgoLabel(request.date)}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    onClick={() =>
                                        handleAccept(request.user._id)
                                    }
                                    disabled={processingIds.has(
                                        request.user._id
                                    )}
                                    className={`${styles.button} ${styles.acceptButton}`}
                                >
                                    <Check className={styles.buttonIcon} />
                                    {processingIds.has(request.user._id)
                                        ? "Đang xử lý..."
                                        : "Chấp nhận"}
                                </button>
                                <button
                                    onClick={() =>
                                        handleDecline(request.user._id)
                                    }
                                    disabled={processingIds.has(
                                        request.user._id
                                    )}
                                    className={`${styles.button} ${styles.declineButton}`}
                                >
                                    <X className={styles.buttonIcon} />
                                    {processingIds.has(request.user._id)
                                        ? "Đang xử lý..."
                                        : "Từ chối"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FriendRequestPage;

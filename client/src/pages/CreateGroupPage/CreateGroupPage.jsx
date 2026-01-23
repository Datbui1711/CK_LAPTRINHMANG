import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, X, Search } from "lucide-react";
import { createGroup } from "../../services/groupService";
import { getFriends } from "../../services/friendService";
import useToastActions from "../../hooks/useToastActions";
import styles from "./CreateGroupPage.module.css";

function CreateGroupPage() {
    const navigate = useNavigate();
    const toast = useToastActions();
    const [name, setName] = useState("");
    const [friends, setFriends] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingFriends, setLoadingFriends] = useState(true);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
            setLoadingFriends(true);
            const response = await getFriends();
            // Handle response structure - same as ChatPage
            if (response && Array.isArray(response)) {
                setFriends(response);
            } else if (response?.data && Array.isArray(response.data)) {
                setFriends(response.data);
            } else {
                setFriends([]);
            }
        } catch (err) {
            console.error("Error loading friends:", err);
            toast.error(err.response?.data?.error || "Không thể tải danh sách bạn bè", "Lỗi");
            setFriends([]);
        } finally {
            setLoadingFriends(false);
        }
    };

    const filteredFriends = friends.filter((friend) => {
        if (!searchQuery.trim()) {
            return true; // Show all if no search query
        }
        // Handle both friend.user structure and direct friend structure
        const friendData = friend.user || friend;
        if (!friendData) return false;
        
        const name = (friendData.name || "").toLowerCase();
        const email = (friendData.email || "").toLowerCase();
        const query = searchQuery.toLowerCase().trim();
        return name.includes(query) || email.includes(query);
    });

    const toggleMember = (friend) => {
        const friendData = friend.user || friend;
        const friendId = friendData._id || friendData;

        if (selectedMembers.includes(friendId)) {
            setSelectedMembers(selectedMembers.filter((id) => id !== friendId));
        } else {
            setSelectedMembers([...selectedMembers, friendId]);
        }
    };

    const removeMember = (memberId) => {
        setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Vui lòng nhập tên nhóm", "Lỗi");
            return;
        }

        try {
            setLoading(true);
            const response = await createGroup(name.trim(), "", selectedMembers);
            console.log("Group created:", response);
            toast.success("Tạo nhóm thành công!", "Thành công");
            
            // Get group ID from response
            const groupId = response?.group?._id || response?.data?.group?._id;
            
            // Dispatch event to refresh groups in ChatPage
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent("refreshGroups"));
            }, 100);
            
            if (groupId) {
                navigate(`/chat?groupId=${groupId}`);
            } else {
                navigate("/chat");
            }
        } catch (err) {
            console.error("Error creating group:", err);
            toast.error(err.response?.data?.error || err.message || "Không thể tạo nhóm", "Lỗi");
        } finally {
            setLoading(false);
        }
    };

    const getSelectedFriendData = (memberId) => {
        return friends.find((f) => {
            const friendData = f.user || f;
            return (friendData._id || friendData).toString() === memberId.toString();
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Tạo nhóm chat</h1>
                <button className={styles.closeButton} onClick={() => navigate(-1)}>
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>
                        Tên nhóm <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên nhóm"
                        className={styles.input}
                        maxLength={50}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Thành viên đã chọn ({selectedMembers.length})
                    </label>
                    {selectedMembers.length > 0 ? (
                        <div className={styles.selectedMembers}>
                            {selectedMembers.map((memberId) => {
                                const friend = getSelectedFriendData(memberId);
                                const friendData = friend?.user || friend || {};
                                return (
                                    <div key={memberId} className={styles.selectedMember}>
                                        <div className={styles.memberAvatar}>
                                            {friendData.avatar ? (
                                                <img src={friendData.avatar} alt={friendData.name} />
                                            ) : (
                                                friendData.name?.charAt(0).toUpperCase() || "?"
                                            )}
                                        </div>
                                        <span className={styles.memberName}>
                                            {friendData.name || "Unknown"}
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            onClick={() => removeMember(memberId)}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className={styles.emptyText}>Chưa chọn thành viên nào</p>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Chọn thành viên</label>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm bạn bè..."
                            className={styles.searchInput}
                        />
                    </div>

                    {loadingFriends ? (
                        <div className={styles.loading}>Đang tải...</div>
                    ) : filteredFriends.length > 0 ? (
                        <div className={styles.friendsList}>
                            {filteredFriends.map((friend, index) => {
                                const friendData = friend.user || friend;
                                const friendId = friendData?._id || friendData || index;
                                const isSelected = selectedMembers.some(
                                    (id) => id.toString() === friendId.toString()
                                );

                                return (
                                    <div
                                        key={friendId}
                                        className={`${styles.friendItem} ${
                                            isSelected ? styles.selected : ""
                                        }`}
                                        onClick={() => toggleMember(friend)}
                                    >
                                        <div className={styles.friendAvatar}>
                                            {friendData.avatar ? (
                                                <img src={friendData.avatar} alt={friendData.name} />
                                            ) : (
                                                friendData.name?.charAt(0).toUpperCase() || "?"
                                            )}
                                        </div>
                                        <div className={styles.friendInfo}>
                                            <div className={styles.friendName}>
                                                {friendData.name || "Unknown"}
                                            </div>
                                            <div className={styles.friendEmail}>
                                                {friendData.email || ""}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className={styles.checkmark}>✓</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className={styles.emptyText}>
                            {searchQuery ? "Không tìm thấy bạn bè" : "Chưa có bạn bè nào"}
                        </p>
                    )}
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => navigate(-1)}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading || !name.trim()}
                    >
                        {loading ? "Đang tạo..." : "Tạo nhóm"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateGroupPage;


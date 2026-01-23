import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Settings,
    Users,
    UserPlus,
    UserMinus,
    Crown,
    X,
    LogOut,
    Trash2,
    Save,
    Search,
} from "lucide-react";
import {
    getGroupById,
    updateGroup,
    updateGroupSettings,
    addMembers,
    removeMember,
    leaveGroup,
    updateAdmin,
    deleteGroup,
} from "../../services/groupService";
import { getFriends } from "../../services/friendService";
import { getProfile } from "../../services/userServices";
import useToastActions from "../../hooks/useToastActions";
import Loading from "../../components/Loading";
import styles from "./GroupSettingsPage.module.css";

function GroupSettingsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const groupId = searchParams.get("groupId");
    const toast = useToastActions();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [group, setGroup] = useState(null);
    const [currentUserId, setCurrentUserId] = useState("");
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("info"); // info, members, settings

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [allowMemberInvite, setAllowMemberInvite] = useState(true);
    const [maxMembers, setMaxMembers] = useState(100);

    useEffect(() => {
        if (groupId) {
            loadData();
            
            // Check if there's a tab parameter in URL
            const tabParam = searchParams.get("tab");
            if (tabParam && ["info", "members", "settings"].includes(tabParam)) {
                setActiveTab(tabParam);
            }
        } else {
            navigate("/chat");
        }
    }, [groupId, searchParams]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [groupRes, profileRes, friendsRes] = await Promise.all([
                getGroupById(groupId),
                getProfile(),
                getFriends(),
            ]);

            // API interceptor đã trả về response.data, nên response là data trực tiếp
            const groupData = groupRes || {};
            console.log("Group data loaded:", groupData);
            
            if (!groupData._id) {
                throw new Error("Không tìm thấy thông tin nhóm");
            }

            setGroup(groupData);
            setName(groupData.name || "");
            setDescription(groupData.description || "");
            setAllowMemberInvite(groupData.settings?.allowMemberInvite ?? true);
            setMaxMembers(groupData.settings?.maxMembers || 100);

            // Handle profile response
            const profileData = profileRes || {};
            setCurrentUserId(profileData._id || "");

            // Handle friends response - can be array or { data: [...] }
            const friendsList = Array.isArray(friendsRes) ? friendsRes : (friendsRes?.data || friendsRes || []);
            setFriends(friendsList);
        } catch (err) {
            console.error("Error loading group data:", err);
            const errorMessage = err.message || err.response?.data?.error || "Không thể tải thông tin nhóm";
            toast.error(errorMessage, "Lỗi");
            navigate("/chat");
        } finally {
            setLoading(false);
        }
    };

    const isCreator = group?.createdBy?._id?.toString() === currentUserId.toString();
    const isAdmin = group?.admins?.some(
        (admin) => admin._id?.toString() === currentUserId.toString()
    ) || isCreator;
    const canManage = isAdmin || isCreator;
    const canAddMembers = canManage || group?.settings?.allowMemberInvite;

    const handleUpdateGroup = async () => {
        if (!canManage) {
            toast.error("Bạn không có quyền cập nhật thông tin nhóm", "Lỗi");
            return;
        }

        try {
            setSaving(true);
            await updateGroup(groupId, { name, description });
            toast.success("Cập nhật thông tin nhóm thành công!", "Thành công");
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Không thể cập nhật nhóm", "Lỗi");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSettings = async () => {
        if (!isCreator) {
            toast.error("Chỉ người tạo nhóm mới có thể thay đổi cài đặt", "Lỗi");
            return;
        }

        try {
            setSaving(true);
            const response = await updateGroupSettings(groupId, {
                allowMemberInvite,
                maxMembers,
            });
            console.log("Update settings response:", response);
            toast.success("Cập nhật cài đặt nhóm thành công!", "Thành công");
            loadData();
        } catch (err) {
            console.error("Error updating settings:", err);
            const errorMessage = err.message || err.response?.data?.error || "Không thể cập nhật cài đặt";
            toast.error(errorMessage, "Lỗi");
        } finally {
            setSaving(false);
        }
    };

    const handleAddMembers = async (memberIds) => {
        if (!canAddMembers) {
            toast.error("Bạn không có quyền thêm thành viên. Chỉ admin mới có thể thêm thành viên.", "Lỗi");
            return;
        }

        if (!Array.isArray(memberIds) || memberIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất một thành viên", "Lỗi");
            return;
        }

        try {
            setSaving(true);
            const response = await addMembers(groupId, memberIds);
            console.log("Add members response:", response);
            toast.success(`Đã thêm ${memberIds.length} thành viên vào nhóm!`, "Thành công");
            
            // Clear search query after adding
            setSearchQuery("");
            
            // Reload data to show new members
            await loadData();
        } catch (err) {
            console.error("Error adding members:", err);
            const errorMessage = err.message || err.response?.data?.error || "Không thể thêm thành viên";
            toast.error(errorMessage, "Lỗi");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!canManage) {
            toast.error("Bạn không có quyền xóa thành viên", "Lỗi");
            return;
        }

        try {
            setSaving(true);
            await removeMember(groupId, memberId);
            toast.success("Đã xóa thành viên khỏi nhóm!", "Thành công");
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Không thể xóa thành viên", "Lỗi");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleAdmin = async (memberId, isAdmin) => {
        if (!isCreator) {
            toast.error("Chỉ người tạo nhóm mới có thể thay đổi admin", "Lỗi");
            return;
        }

        try {
            setSaving(true);
            await updateAdmin(groupId, memberId, isAdmin);
            toast.success(isAdmin ? "Đã thêm admin!" : "Đã xóa admin!", "Thành công");
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Không thể cập nhật admin", "Lỗi");
        } finally {
            setSaving(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (isCreator) {
            toast.error("Người tạo nhóm không thể rời nhóm", "Lỗi");
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn rời nhóm này?")) {
            return;
        }

        try {
            setSaving(true);
            await leaveGroup(groupId);
            toast.success("Đã rời nhóm thành công!", "Thành công");
            navigate("/chat");
        } catch (err) {
            toast.error(err.response?.data?.error || "Không thể rời nhóm", "Lỗi");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!isCreator) {
            toast.error("Chỉ người tạo nhóm mới có thể xóa nhóm", "Lỗi");
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn xóa nhóm này? Hành động này không thể hoàn tác!")) {
            return;
        }

        try {
            setSaving(true);
            const response = await deleteGroup(groupId);
            console.log("Delete group response:", response);
            toast.success("Đã xóa nhóm thành công!", "Thành công");
            
            // Dispatch event to refresh groups in ChatPage
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent("refreshGroups"));
            }, 100);
            
            navigate("/chat");
        } catch (err) {
            console.error("Error deleting group:", err);
            // API interceptor throws Error object, not axios error
            const errorMessage = err.message || err.response?.data?.error || "Không thể xóa nhóm";
            toast.error(errorMessage, "Lỗi");
        } finally {
            setSaving(false);
        }
    };

    const getAvailableFriends = () => {
        if (!group || !friends || !Array.isArray(friends)) return [];
        
        // Get member IDs from group - handle both populated and non-populated
        const memberIds = group.members?.map((m) => {
            const memberUser = m.user?._id || m.user;
            return memberUser?.toString();
        }).filter(Boolean) || [];
        
        return friends.filter((f) => {
            const friendData = f.user || f;
            const friendId = (friendData._id || friendData)?.toString();
            return friendId && !memberIds.includes(friendId) && friendId !== currentUserId.toString();
        });
    };

    const filteredAvailableFriends = getAvailableFriends().filter((friend) => {
        const friendData = friend.user || friend;
        const name = friendData.name?.toLowerCase() || "";
        const email = friendData.email?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return name.includes(query) || email.includes(query);
    });

    const checkIsMemberAdmin = (member) => {
        const memberId = (member.user?._id || member.user)?.toString();
        if (!memberId || !group?.admins) return false;
        
        // Handle both populated (admin._id) and non-populated (admin is ObjectId)
        return group.admins.some((admin) => {
            const adminId = admin._id?.toString() || admin?.toString();
            return adminId === memberId;
        });
    };

    if (loading) {
        return <Loading fullScreen={true} text="Đang tải..." />;
    }

    if (!group) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <Settings size={24} />
                    Cài đặt nhóm
                </h1>
                <button className={styles.closeButton} onClick={() => navigate(-1)}>
                    <X size={24} />
                </button>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "info" ? styles.active : ""}`}
                    onClick={() => setActiveTab("info")}
                >
                    Thông tin
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "members" ? styles.active : ""}`}
                    onClick={() => setActiveTab("members")}
                >
                    Thành viên ({group.members?.length || 0})
                </button>
                {isCreator && (
                    <button
                        className={`${styles.tab} ${activeTab === "settings" ? styles.active : ""}`}
                        onClick={() => setActiveTab("settings")}
                    >
                        Cài đặt
                    </button>
                )}
            </div>

            <div className={styles.content}>
                {activeTab === "info" && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Thông tin nhóm</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tên nhóm</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={styles.input}
                                disabled={!canManage}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Mô tả</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={styles.textarea}
                                rows={3}
                                disabled={!canManage}
                            />
                        </div>
                        {canManage && (
                            <button
                                className={styles.saveButton}
                                onClick={handleUpdateGroup}
                                disabled={saving}
                            >
                                <Save size={16} />
                                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        )}
                    </div>
                )}

                {activeTab === "members" && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Quản lý thành viên</h2>

                        {canAddMembers && (
                            <div className={styles.addMemberSection}>
                                <div className={styles.searchBox}>
                                    <Search size={18} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tìm kiếm bạn bè để thêm..."
                                        className={styles.searchInput}
                                    />
                                </div>

                                {filteredAvailableFriends.length > 0 ? (
                                    <div className={styles.availableFriends}>
                                        {filteredAvailableFriends.map((friend) => {
                                            const friendData = friend.user || friend;
                                            return (
                                                <div key={friendData._id || friendData} className={styles.friendCard}>
                                                    <div className={styles.friendAvatar}>
                                                        {friendData.avatar ? (
                                                            <img src={friendData.avatar} alt={friendData.name} />
                                                        ) : (
                                                            friendData.name?.charAt(0).toUpperCase() || "?"
                                                        )}
                                                    </div>
                                                    <div className={styles.friendInfo}>
                                                        <div className={styles.friendName}>{friendData.name}</div>
                                                        <div className={styles.friendEmail}>{friendData.email}</div>
                                                    </div>
                                                    <button
                                                        className={styles.addButton}
                                                        onClick={() =>
                                                            handleAddMembers([friendData._id || friendData])
                                                        }
                                                        disabled={saving}
                                                    >
                                                        <UserPlus size={16} />
                                                        Thêm
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className={styles.emptyText}>
                                        {searchQuery
                                            ? "Không tìm thấy bạn bè"
                                            : "Không còn bạn bè nào để thêm"}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className={styles.membersList}>
                            <h3 className={styles.subTitle}>Thành viên trong nhóm</h3>
                            {group.members?.map((member) => {
                                const memberData = member.user || {};
                                const memberId = (memberData._id || member.user)?.toString();
                                const isCurrentUser = memberId === currentUserId.toString();
                                const isMemberAdmin = checkIsMemberAdmin(member);
                                const isCreatorMember = group.createdBy?._id?.toString() === memberId;

                                return (
                                    <div key={memberId} className={styles.memberCard}>
                                        <div className={styles.memberAvatar}>
                                            {memberData.avatar ? (
                                                <img src={memberData.avatar} alt={memberData.name} />
                                            ) : (
                                                memberData.name?.charAt(0).toUpperCase() || "?"
                                            )}
                                        </div>
                                        <div className={styles.memberInfo}>
                                            <div className={styles.memberName}>
                                                {memberData.name || "Unknown"}
                                                {isCreatorMember && (
                                                    <span className={styles.creatorBadge}>
                                                        <Crown size={14} /> Tạo nhóm
                                                    </span>
                                                )}
                                                {isMemberAdmin && !isCreatorMember && (
                                                    <span className={styles.adminBadge}>
                                                        <Crown size={14} /> Admin
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.memberEmail}>{memberData.email || ""}</div>
                                        </div>
                                        <div className={styles.memberActions}>
                                            {isCreator && !isCurrentUser && !isCreatorMember && (
                                                <>
                                                    <button
                                                        className={styles.toggleAdminButton}
                                                        onClick={() => handleToggleAdmin(memberId, !isMemberAdmin)}
                                                        disabled={saving}
                                                        title={isMemberAdmin ? "Xóa admin" : "Thêm admin"}
                                                    >
                                                        <Crown size={16} />
                                                    </button>
                                                    {canManage && (
                                                        <button
                                                            className={styles.removeButton}
                                                            onClick={() => handleRemoveMember(memberId)}
                                                            disabled={saving}
                                                            title="Xóa thành viên"
                                                        >
                                                            <UserMinus size={16} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {!isCreator && canManage && !isCurrentUser && (
                                                <button
                                                    className={styles.removeButton}
                                                    onClick={() => handleRemoveMember(memberId)}
                                                    disabled={saving}
                                                    title="Xóa thành viên"
                                                >
                                                    <UserMinus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === "settings" && isCreator && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Cài đặt nhóm</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={allowMemberInvite}
                                    onChange={(e) => {
                                        console.log("Allow member invite changed:", e.target.checked);
                                        setAllowMemberInvite(e.target.checked);
                                    }}
                                    className={styles.checkbox}
                                />
                                <span>Cho phép thành viên mời người khác</span>
                            </label>
                            <p className={styles.helpText}>
                                Khi bật, các thành viên trong nhóm có thể thêm người khác vào nhóm
                            </p>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Số thành viên tối đa: {maxMembers}
                            </label>
                            <input
                                type="range"
                                min="2"
                                max="100"
                                value={maxMembers}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    // Đảm bảo không vượt quá 100
                                    setMaxMembers(Math.min(100, Math.max(2, value)));
                                }}
                                className={styles.rangeInput}
                            />
                        </div>
                        <button
                            className={styles.saveButton}
                            onClick={handleUpdateSettings}
                            disabled={saving}
                        >
                            <Save size={16} />
                            {saving ? "Đang lưu..." : "Lưu cài đặt"}
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                {!isCreator && (
                    <button
                        className={styles.leaveButton}
                        onClick={handleLeaveGroup}
                        disabled={saving}
                    >
                        <LogOut size={16} />
                        Rời nhóm
                    </button>
                )}
                {isCreator && (
                    <button
                        className={styles.deleteButton}
                        onClick={handleDeleteGroup}
                        disabled={saving}
                    >
                        <Trash2 size={16} />
                        Xóa nhóm
                    </button>
                )}
            </div>
        </div>
    );
}

export default GroupSettingsPage;


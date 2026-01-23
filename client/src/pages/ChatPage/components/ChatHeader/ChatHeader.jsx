import { useNavigate } from "react-router-dom";
import { Settings, Users, UserPlus } from "lucide-react";
import config from "../../../../config";
import styles from "./ChatHeader.module.css";

function ChatHeader({ friend, group }) {
    const navigate = useNavigate();

    if (!friend && !group) {
        return null;
    }

    const displayName = group ? group.name : friend?.name;
    const displayAvatar = group ? group.avatar : friend?.avatar;
    const memberCount = group ? group.members?.length || 0 : null;

    return (
        <div className={styles["chat-header"]}>
            <div
                className={`${styles["friend-avatar"]} ${styles["header-avatar"]}`}
            >
                {displayAvatar ? (
                    <img src={displayAvatar} alt={displayName} />
                ) : (
                    displayName?.charAt(0).toUpperCase() || "?"
                )}
            </div>
            <div className={styles["header-info"]}>
                <h3>{displayName}</h3>
                {group ? (
                    <span className={styles["group-info"]}>
                        <Users size={14} />
                        {memberCount} thành viên
                    </span>
                ) : (
                    <span className={`${styles["status"]} ${styles["online"]}`}>
                        Đang hoạt động
                    </span>
                )}
            </div>
            {group && (
                <div className={styles["header-actions"]}>
                    <button
                        className={styles["add-member-button"]}
                        onClick={() => navigate(`${config.routes.groupSettings}?groupId=${group._id}&tab=members`)}
                        title="Thêm thành viên"
                    >
                        <UserPlus size={18} />
                    </button>
                    <button
                        className={styles["settings-button"]}
                        onClick={() => navigate(`${config.routes.groupSettings}?groupId=${group._id}`)}
                        title="Cài đặt nhóm"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ChatHeader;

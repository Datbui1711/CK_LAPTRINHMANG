"use client";

import { useNavigate } from "react-router-dom";
import { Users, UserPlus } from "lucide-react";
import config from "../../../../config";
import styles from "./FriendList.module.css";

function FriendList({
    friends,
    groups,
    recipientId,
    groupId,
    unreadMessages,
    onSelectFriend,
    onSelectGroup,
}) {
    const navigate = useNavigate();

    return (
        <>
            <div className={styles["sidebar-header"]}>
                <h3>Trò chuyện</h3>
                <button
                    className={styles["create-group-button"]}
                    onClick={() => navigate(config.routes.createGroup)}
                    title="Tạo nhóm mới"
                >
                    <UserPlus size={18} />
                </button>
            </div>

            {groups && groups.length > 0 && (
                <div className={styles["section"]}>
                    <div className={styles["section-header"]}>
                        <Users size={16} />
                        <span>Nhóm ({groups.length})</span>
                    </div>
                    <div className={styles["groups-list"]}>
                        {groups.map((group) => (
                            <div
                                key={group._id}
                                className={`${styles["group-item"]} ${
                                    groupId === group._id ? styles["active"] : ""
                                }`}
                                onClick={() => onSelectGroup(group._id)}
                            >
                                <div className={styles["group-avatar"]}>
                                    {group.avatar ? (
                                        <img src={group.avatar} alt={group.name} />
                                    ) : (
                                        <Users size={20} />
                                    )}
                                </div>
                                <div className={styles["group-info"]}>
                                    <div className={styles["group-name"]}>
                                        {group.name}
                                    </div>
                                    <div className={styles["group-members"]}>
                                        {group.members?.length || 0} thành viên
                                    </div>
                                </div>
                                {unreadMessages[`group:${group._id}`] > 0 && (
                                    <span className={styles["unread-badge"]}>
                                        {unreadMessages[`group:${group._id}`] > 99
                                            ? "99+"
                                            : unreadMessages[`group:${group._id}`] > 9
                                            ? "9+"
                                            : unreadMessages[`group:${group._id}`]}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles["section"]}>
                <div className={styles["section-header"]}>
                    <span>Bạn bè</span>
                </div>
                <div className={styles["friends-list"]}>
                    {friends.length === 0 ? (
                        <div className={styles["no-friends"]}>Không có bạn bè</div>
                    ) : (
                        friends.map((friend) => (
                            <div
                                key={friend._id}
                                className={`${styles["friend-item"]} ${
                                    recipientId === friend._id ? styles["active"] : ""
                                }`}
                                onClick={() => onSelectFriend(friend._id)}
                            >
                                <div className={styles["friend-avatar"]}>
                                    {friend.avatar ? (
                                        <img src={friend.avatar} alt={friend.name} />
                                    ) : (
                                        friend.name?.charAt(0).toUpperCase() || "?"
                                    )}
                                </div>
                                <div className={styles["friend-info"]}>
                                    <div className={styles["friend-name"]}>
                                        {friend.name}
                                    </div>
                                    <div className={styles["friend-email"]}>
                                        {friend.email}
                                    </div>
                                </div>
                                {unreadMessages[friend._id] > 0 && (
                                    <span className={styles["unread-badge"]}>
                                        {unreadMessages[friend._id] > 99
                                            ? "99+"
                                            : unreadMessages[friend._id] > 9
                                            ? "9+"
                                            : unreadMessages[friend._id]}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

export default FriendList;

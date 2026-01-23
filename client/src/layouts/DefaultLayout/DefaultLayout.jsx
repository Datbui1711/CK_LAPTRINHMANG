import { Users, UserPlus, MessageCircle, Search, LogOut, Sun, Moon } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import styles from "./DefaultLayout.module.css";
import config from "../../config";
import { logout, getProfile } from "../../services/userServices";
import useToastActions from "../../hooks/useToastActions";
import { useState, useEffect } from "react";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import constants from "../../constants";
import { useTheme } from "../../hooks/useTheme";
import socket from "../../socket";

function DefaultLayout({ children }) {
    const navigate = useNavigate();
    const toast = useToastActions();
    const { isDark, toggleTheme } = useTheme();

    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [isOnline, setIsOnline] = useState(false);

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                if (response) {
                    setUserProfile(response);
                }
            } catch (err) {
                console.log("Error fetching profile:", err);
            }
        };

        fetchProfile();
    }, []);

    // Monitor socket connection status for online/offline
    useEffect(() => {
        const handleConnect = () => {
            setIsOnline(true);
        };

        const handleDisconnect = () => {
            setIsOnline(false);
        };

        // Set initial status
        setIsOnline(socket.connected);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, []);

    const handleLogout = async () => {
        try {
            const response = await logout();
            toast.success(
                response.message || "Đăng xuất thành công",
                "Thông báo",
                {
                    duration: 6000,
                }
            );
            navigate(config.routes.login);
        } catch (err) {
            toast.error(
                err.message || "Đăng xuất không thành công",
                "Lỗi hệ thống",
                {
                    duration: 6000,
                }
            );
        }
    };

    return (
        <div className={styles.container}>
            <nav className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.title}>{constants.APP_NAME}</h2>
                    <div className={styles.themeToggle}>
                        <Sun className={styles.themeIcon} size={18} />
                        <button
                            className={`${styles.toggleSwitch} ${isDark ? styles.dark : ""}`}
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                        >
                            <span className={styles.toggleThumb}></span>
                        </button>
                        <Moon className={styles.themeIcon} size={18} />
                    </div>
                </div>

                <ul className={styles.navList}>
                    <li className={styles.navItem}>
                        <NavLink
                            to={config.routes.chat}
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.navLink} ${styles.active}`
                                    : styles.navLink
                            }
                        >
                            <MessageCircle className={styles.icon} />
                            <span>Nhắn tin</span>
                        </NavLink>
                    </li>
                    <li className={styles.navItem}>
                        <NavLink
                            to={config.routes.search}
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.navLink} ${styles.active}`
                                    : styles.navLink
                            }
                        >
                            <Search className={styles.icon} />
                            <span>Tìm kiếm</span>
                        </NavLink>
                    </li>
                    <li className={styles.navItem}>
                        <NavLink
                            to={config.routes.friendRequest}
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.navLink} ${styles.active}`
                                    : styles.navLink
                            }
                        >
                            <UserPlus className={styles.icon} />
                            <span>Lời mời kết bạn</span>
                        </NavLink>
                    </li>
                    <li className={styles.navItem}>
                        <NavLink
                            to={config.routes.friends}
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.navLink} ${styles.active}`
                                    : styles.navLink
                            }
                        >
                            <Users className={styles.icon} />
                            <span>Danh sách bạn bè</span>
                        </NavLink>
                    </li>
                    <li className={styles.navItem}>
                        <NavLink
                            onClick={() => {
                                setShowLogoutDialog(true);
                            }}
                            className={styles.navLink}
                        >
                            <LogOut className={styles.icon} />
                            <span>Đăng xuất</span>
                        </NavLink>
                    </li>
                </ul>

                {/* User Profile Bar - Fixed at bottom */}
                {userProfile && (
                    <div className={styles.userProfileBar}>
                        <div className={styles.userAvatar}>
                            {userProfile.avatar ? (
                                <img src={userProfile.avatar} alt={userProfile.name || userProfile.email} />
                            ) : (
                                <div className={styles.avatarFallback}>
                                    {(userProfile.name || userProfile.email || "U")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}
                            <span
                                className={`${styles.statusIndicator} ${
                                    isOnline ? styles.online : styles.offline
                                }`}
                            ></span>
                        </div>
                        <div className={styles.userInfo}>
                            <div className={styles.userName}>
                                {userProfile.name || "Người dùng"}
                            </div>
                            <div className={styles.userEmail}>{userProfile.email}</div>
                            <div className={styles.userStatus}>
                                {isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            <main className={styles.mainContent}>{children}</main>

            <ConfirmDialog
                isOpen={showLogoutDialog}
                title="Xác nhận đăng xuất"
                message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?"
                confirmText="Đăng xuất"
                cancelText="Hủy"
                variant="info"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutDialog(false)}
            />
        </div>
    );
}

export default DefaultLayout;
